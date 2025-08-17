import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum LeaveType {
  ANNUAL = 'Annual',
  SICK = 'Sick',
  MATERNITY = 'Maternity',
  PATERNITY = 'Paternity',
  UNPAID = 'Unpaid'
}

@Entity()
export class Leave {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  empId: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: LeaveType,
    default: LeaveType.ANNUAL
  })
  leaveType: LeaveType;

  @Column()
  department: string;

  @Column()
  days: number;

  @Column({ default: 'Pending' })
  status: 'Pending' | 'Approved' | 'Rejected';
}
