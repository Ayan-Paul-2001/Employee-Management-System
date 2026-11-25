import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ApprovalStatus } from '../enums/approval-status.enum.js';
import { Role } from '../enums/role.enum.js';

@Injectable()
export class ApprovedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // HR Super Admin is always approved by default
    if (user.role === Role.HR) return true;

    const status =
      user.approvalStatus ||
      (user.isApproved === false
        ? ApprovalStatus.PENDING
        : ApprovalStatus.APPROVED);

    if (status === ApprovalStatus.PENDING) {
      throw new ForbiddenException(
        'Your employment application is pending HR or Admin approval.',
      );
    }

    if (status === ApprovalStatus.REJECTED) {
      throw new ForbiddenException(
        'Your employment application was not approved.',
      );
    }

    return true;
  }
}
