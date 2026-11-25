import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../common/enums/role.enum';
import { ApprovalStatus } from '../common/enums/approval-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { MailService } from '../mail/mail.service';
import { CacheService } from '../common/cache.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly authCache = new Map<string, { user: any; expiresAt: number }>();
  private readonly AUTH_CACHE_TTL_MS = 30_000;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
  ) {}

  invalidateAuthCache(userId: string) {
    this.authCache.delete(userId);
    this.cacheService.invalidatePrefix('users:');
    this.cacheService.invalidatePrefix('attendance:analytics:');
  }

  async findAuthUser(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const now = Date.now();
    const cached = this.authCache.get(id);
    if (cached && cached.expiresAt > now) {
      return cached.user;
    }

    const doc: any = await this.userModel
      .findById(id)
      .select('-passwordHash -passwordResetCode -passwordResetCodeExpiry -__v')
      .lean()
      .exec();
    if (!doc || !doc.isActive) {
      this.authCache.delete(id);
      return null;
    }

    const normalized = {
      ...doc,
      id: doc._id.toString(),
      approvalStatus:
        doc.approvalStatus ||
        (doc.isApproved === false
          ? ApprovalStatus.PENDING
          : ApprovalStatus.APPROVED),
    };
    delete normalized._id;
    this.authCache.set(id, { user: normalized, expiresAt: now + this.AUTH_CACHE_TTL_MS });
    return normalized;
  }

  async onModuleInit() {
    await this.ensureDefaultHrUser();
  }

  async ensureDefaultHrUser(): Promise<UserDocument> {
    const email = (
      this.configService.get<string>('DEFAULT_HR_EMAIL') || 'hr@nexthunt.com'
    )
      .trim()
      .toLowerCase();
    const password =
      this.configService.get<string>('DEFAULT_HR_PASSWORD') || 'NextHunt@HR123';
    const fullName =
      this.configService.get<string>('DEFAULT_HR_NAME') || 'HR Super Admin';

    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      if (
        existing.role !== Role.HR ||
        !existing.isApproved ||
        existing.approvalStatus !== ApprovalStatus.APPROVED
      ) {
        existing.role = Role.HR;
        existing.isApproved = true;
        existing.approvalStatus = ApprovalStatus.APPROVED;
        existing.isActive = true;
        await existing.save();
      }
      return existing;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const employeeCode = await this.generateEmployeeCode();
    const hrUser = await this.userModel.create({
      fullName,
      email,
      passwordHash,
      role: Role.HR,
      employeeCode,
      department: 'Human Resources',
      position: 'Head of HR (Super Admin)',
      isApproved: true,
      approvalStatus: ApprovalStatus.APPROVED,
      isActive: true,
      dateOfJoining: new Date(),
    });
    this.logger.log(`Seeded default HR Super Admin account: ${email}`);
    return hrUser;
  }

  async generateEmployeeCode(): Promise<string> {
    const count = await this.userModel.countDocuments().exec();
    let seq = 1001 + count;
    while (true) {
      const candidate = `NH-${seq}`;
      const exists = await this.userModel.exists({ employeeCode: candidate });
      if (!exists) return candidate;
      seq++;
    }
  }

  async createEmployee(dto: CreateUserDto): Promise<UserDocument> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const employeeCode = await this.generateEmployeeCode();

    const created = await this.userModel.create({
      fullName: dto.fullName.trim(),
      email,
      passwordHash,
      role: Role.EMPLOYEE, // Always default to Employee on signup
      employeeCode,
      department: dto.department?.trim() || 'General',
      position: dto.position?.trim() || 'Team Member',
      phoneNumber: dto.phoneNumber?.trim() || '',
      isApproved: false,
      approvalStatus: ApprovalStatus.PENDING,
      isActive: true,
      dateOfJoining: new Date(),
    });

    this.cacheService.invalidatePrefix('users:');
    this.cacheService.invalidatePrefix('attendance:analytics:');
    return created;
  }

  async createSeedUser(data: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
    department: string;
    position: string;
    phoneNumber?: string;
  }): Promise<UserDocument> {
    const email = data.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) return existing;

    const passwordHash = await bcrypt.hash(data.password, 10);
    const employeeCode = await this.generateEmployeeCode();

    return this.userModel.create({
      fullName: data.fullName,
      email,
      passwordHash,
      role: data.role,
      employeeCode,
      department: data.department,
      position: data.position,
      phoneNumber: data.phoneNumber || '',
      isApproved: true,
      approvalStatus: ApprovalStatus.APPROVED,
      isActive: true,
      dateOfJoining: new Date(),
    });
  }

  async findAll() {
    return this.cacheService.getOrSet('users:all', async () => {
      const users: any[] = await this.userModel
        .find({
          isActive: true,
          $or: [
            { approvalStatus: ApprovalStatus.APPROVED },
            { approvalStatus: { $exists: false }, isApproved: { $ne: false } },
          ],
        })
        .select('-passwordHash -passwordResetCode -passwordResetCodeExpiry -__v')
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return users.map(({ _id, ...rest }) => ({
        ...rest,
        id: _id.toString(),
        approvalStatus: rest.approvalStatus || ApprovalStatus.APPROVED,
      }));
    });
  }

  async findApplicants(status = 'all') {
    const cacheKey = `users:applicants:${status}`;
    return this.cacheService.getOrSet(cacheKey, async () => {
      const statusFilter =
        status === ApprovalStatus.PENDING || status === ApprovalStatus.REJECTED
          ? { approvalStatus: status }
          : {
              approvalStatus: {
                $in: [ApprovalStatus.PENDING, ApprovalStatus.REJECTED],
              },
            };

      const [items, pendingCount, rejectedCount] = await Promise.all([
        this.userModel
          .find({ ...statusFilter, isActive: true })
          .select('-passwordHash -passwordResetCode -passwordResetCodeExpiry -__v')
          .populate('reviewedBy', 'fullName email role')
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
        this.userModel.countDocuments({
          approvalStatus: ApprovalStatus.PENDING,
          isActive: true,
        }),
        this.userModel.countDocuments({
          approvalStatus: ApprovalStatus.REJECTED,
          isActive: true,
        }),
      ]);

      return {
        items: items.map(({ _id, reviewedBy, ...rest }: any) => {
          const reviewer =
            reviewedBy && typeof reviewedBy === 'object'
              ? {
                  id: reviewedBy._id?.toString() || reviewedBy.id,
                  fullName: reviewedBy.fullName,
                  email: reviewedBy.email,
                  role: reviewedBy.role,
                }
              : null;
          return {
            ...rest,
            id: _id.toString(),
            reviewer,
          };
        }),
        pendingCount,
        rejectedCount,
      };
    });
  }

  async approveApplicant(
    targetId: string,
    reviewer: { id: string; fullName: string; role: Role },
  ) {
    const user = await this.findOne(targetId);
    if (user.role === Role.HR) {
      throw new ForbiddenException('HR Super Admin is already approved.');
    }

    user.approvalStatus = ApprovalStatus.APPROVED;
    user.isApproved = true;
    user.rejectionReason = null;
    user.reviewedBy = new Types.ObjectId(reviewer.id);
    user.reviewedAt = new Date();
    await user.save();

    this.invalidateAuthCache(targetId);

    await this.notificationsService.createForUser(user._id, {
      type: NotificationType.ROLE_UPDATED,
      title: 'Employment Application Approved',
      message: `Welcome to Next Hunt! Your account was approved by ${reviewer.fullName}.`,
      metadata: { approvalStatus: ApprovalStatus.APPROVED },
    });

    await this.mailService.sendApplicantDecisionEmail(
      user.email,
      user.fullName,
      user.employeeCode,
      'approved',
      reviewer.fullName,
    );

    return user.toJSON();
  }

  async rejectApplicant(
    targetId: string,
    reviewer: { id: string; fullName: string; role: Role },
    reason?: string,
  ) {
    const user = await this.findOne(targetId);
    if (user.role === Role.HR || user.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Existing HR or Admin accounts cannot be rejected as applicants.',
      );
    }

    user.approvalStatus = ApprovalStatus.REJECTED;
    user.isApproved = false;
    user.rejectionReason = reason?.trim() || null;
    user.reviewedBy = new Types.ObjectId(reviewer.id);
    user.reviewedAt = new Date();
    await user.save();

    this.invalidateAuthCache(targetId);

    await this.mailService.sendApplicantDecisionEmail(
      user.email,
      user.fullName,
      user.employeeCode,
      'rejected',
      reviewer.fullName,
      user.rejectionReason || undefined,
    );

    return user.toJSON();
  }

  async findByRoles(roles: Role[]): Promise<UserDocument[]> {
    return this.userModel
      .find({
        role: { $in: roles },
        isActive: true,
        isApproved: { $ne: false },
      })
      .exec();
  }

  async getStats() {
    return this.cacheService.getOrSet('users:stats', async () => {
      const [grouped, pendingApplicants, rejectedApplicants] = await Promise.all([
        this.userModel.aggregate([
          {
            $match: {
              isActive: true,
              $or: [
                { approvalStatus: ApprovalStatus.APPROVED },
                { approvalStatus: { $exists: false }, isApproved: { $ne: false } },
              ],
            },
          },
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ]),
        this.userModel.countDocuments({
          isActive: true,
          approvalStatus: ApprovalStatus.PENDING,
        }),
        this.userModel.countDocuments({
          isActive: true,
          approvalStatus: ApprovalStatus.REJECTED,
        }),
      ]);

      const counts: Record<string, number> = {
        [Role.HR]: 0,
        [Role.ADMIN]: 0,
        [Role.EMPLOYEE]: 0,
      };
      for (const row of grouped) {
        counts[row._id] = row.count;
      }

      const hr = counts[Role.HR] || 0;
      const admin = counts[Role.ADMIN] || 0;
      const employee = counts[Role.EMPLOYEE] || 0;

      return {
        total: hr + admin + employee,
        hr,
        admin,
        employee,
        trackedStaff: admin + employee,
        pendingApplicants,
        rejectedApplicants,
      };
    });
  }

  async findOne(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.findOne(id);
    if (dto.fullName !== undefined) user.fullName = dto.fullName.trim();
    if (dto.department !== undefined) user.department = dto.department.trim();
    if (dto.position !== undefined) user.position = dto.position.trim();
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber.trim();
    if (dto.address !== undefined) user.address = dto.address.trim();
    await user.save();
    this.invalidateAuthCache(id);
    return user.toJSON();
  }

  /** Only HR Super Admin can upgrade/change a member's role */
  async updateRole(targetId: string, dto: UpdateRoleDto, actorId: string) {
    if (targetId === actorId) {
      throw new ForbiddenException('You cannot change your own role.');
    }

    const user = await this.findOne(targetId);
    if (user.role === Role.HR) {
      throw new ForbiddenException('HR Super Admin role cannot be modified.');
    }

    const previousRole = user.role;
    user.role = dto.role;
    await user.save();
    this.invalidateAuthCache(targetId);

    if (previousRole !== dto.role) {
      const label = dto.role === Role.ADMIN ? 'Admin' : 'Employee';
      await this.notificationsService.createForUser(user._id, {
        type: NotificationType.ROLE_UPDATED,
        title: `Role Updated to ${label}`,
        message: `HR has updated your account role from ${previousRole.toUpperCase()} to ${label.toUpperCase()}.`,
        metadata: { previousRole, newRole: dto.role },
      });
      await this.mailService.sendRoleUpdatedEmail(
        user.email,
        user.fullName,
        label,
      );
    }

    return user.toJSON();
  }

  async remove(targetId: string, actorId: string): Promise<{ success: boolean }> {
    if (targetId === actorId) {
      throw new ForbiddenException('You cannot delete your own account.');
    }
    const user = await this.findOne(targetId);
    if (user.role === Role.HR) {
      throw new ForbiddenException('HR Super Admin account cannot be deleted.');
    }
    await this.userModel.deleteOne({ _id: user._id }).exec();
    this.invalidateAuthCache(targetId);
    return { success: true };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findOne(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect.');
    }

    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestException(
        'New password must be different from your current password.',
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetCode = null;
    user.passwordResetCodeExpiry = null;
    await user.save();
    this.invalidateAuthCache(userId);
  }

  async setPasswordResetCode(
    userId: string,
    code: string,
    expiryMinutes = 15,
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          passwordResetCode: code,
          passwordResetCodeExpiry: new Date(
            Date.now() + expiryMinutes * 60 * 1000,
          ),
        },
      },
    );
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user || !user.passwordResetCode) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    if (user.passwordResetCode !== code.trim()) {
      throw new BadRequestException('Invalid verification code. Please double-check and try again.');
    }

    if (
      !user.passwordResetCodeExpiry ||
      new Date() > new Date(user.passwordResetCodeExpiry)
    ) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new code.',
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetCode = null;
    user.passwordResetCodeExpiry = null;
    await user.save();
  }
}
