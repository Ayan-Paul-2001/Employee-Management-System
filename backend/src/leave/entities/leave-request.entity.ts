import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeProfile } from '../../employees/entities/employee-profile.entity';
import { User } from '../../users/entities/user.entity';
import { LeaveStatus } from '../../common/enums/leave-status.enum';

enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER'
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fromDate: Date;

  @Column({ type: 'date' })
  toDate: Date;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;
  
  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({
    type: 'enum',
    enum: LeaveType,
    default: LeaveType.ANNUAL,
    nullable: true
  })
  type: LeaveType;

  @ManyToOne(() => EmployeeProfile, (employee) => employee.leaveRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeProfile;

  @Column()
  employeeId: number; // This references the EmployeeProfile.id which is a number

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approverId' })
  approver: User;

  @Column({ nullable: true })
  approverId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}