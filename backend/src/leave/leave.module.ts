import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from './entities/leave.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Leave])],
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}
