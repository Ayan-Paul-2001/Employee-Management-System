import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard.js';
import { ApprovedUserGuard } from './guards/approved-user.guard.js';
import { CacheService } from './cache.service.js';

@Global()
@Module({
  providers: [RolesGuard, ApprovedUserGuard, CacheService],
  exports: [RolesGuard, ApprovedUserGuard, CacheService],
})
export class CommonModule {}
