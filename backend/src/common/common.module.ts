import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { ApprovedUserGuard } from './guards/approved-user.guard';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [RolesGuard, ApprovedUserGuard, CacheService],
  exports: [RolesGuard, ApprovedUserGuard, CacheService],
})
export class CommonModule {}
