import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto, verificationCode?: string): Promise<User> {
    const { email, password, ...rest } = createUserDto;

    // Check if user with this email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      // If the user exists but is not verified, delete the old record so they can re-register
      if (!existingUser.isVerified) {
        await this.usersRepository.remove(existingUser);
      } else {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create and save the new user
    const newUser = this.usersRepository.create({
      ...rest,
      email,
      passwordHash,
      role: rest.role?.toLowerCase() as Role || Role.EMPLOYEE,
      verificationToken: verificationCode,
      isVerified: false,
      verificationTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    return this.usersRepository.save(newUser);
  }

  /** Create a pre-verified user (used by HR/Admin to create Admins without email verification) */
  async createVerified(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...rest } = createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      ...rest,
      email,
      passwordHash,
      role: rest.role?.toLowerCase() as Role,
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });

    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Update user properties
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<User> {
    const user = await this.findOne(id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.passwordHash = passwordHash;

    return this.usersRepository.save(user);
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<User> {
    const user = await this.findOne(id);

    // Update role
    user.role = updateRoleDto.role.toLowerCase() as Role;

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { verificationToken: token } });
  }

  async findByEmailAndCode(email: string, code: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, verificationToken: code }
    });
  }

  async verifyUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    return this.usersRepository.save(user);
  }

  async updateVerificationCode(id: number, code: string): Promise<User> {
    const user = await this.findOne(id);
    user.verificationToken = code;
    user.verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    return this.usersRepository.save(user);
  }
}