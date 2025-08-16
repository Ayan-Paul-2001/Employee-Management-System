import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Leave {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  empId: number;

  @Column()
  name: string;

  @Column()
  leaveType: string;

  @Column()
  department: string;

  @Column()
  days: number;

  @Column({ default: 'Pending' })
  status: 'Pending' | 'Approved' | 'Rejected';
}
