import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';

@Entity('employee_profiles')
export class EmployeeProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  employeeId: string;

  @Column()
  department: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  dateOfJoining: Date;

  @OneToOne(() => User, (user) => user.employeeProfile)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendanceRecords: Attendance[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
  leaveRequests: LeaveRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}