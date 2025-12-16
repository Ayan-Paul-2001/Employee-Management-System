import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveRequest } from './entities/leave-request.entity';
import { EmployeesModule } from '../employees/employees.module';
import { PusherModule } from '../common/services/pusher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest]),
    EmployeesModule,
    PusherModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}