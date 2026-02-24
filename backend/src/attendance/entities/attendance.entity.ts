import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeProfile } from '../../employees/entities/employee-profile.entity';
import { AttendanceStatus } from '../../common/enums/attendance-status.enum';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'time', nullable: true })
  checkInTime: Date;

  @Column({ type: 'time', nullable: true })
  checkOutTime: Date;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ nullable: true })
  rejectionReason: string;

  @ManyToOne(() => EmployeeProfile, (employee) => employee.attendanceRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeProfile;

  @Column()
  employeeId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}