import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { User } from '../auth/entities/user.entity';
import { Employee } from './entities/employee.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { PerformanceReview } from './entities/performance-review.entity';
import { Announcement } from './entities/announcement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, LeaveRequest, PerformanceReview, Announcement])],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {} 