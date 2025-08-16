import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';


import { User } from '../../auth/entities/user.entity';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column()
  adminId: number;

  @Column()
  adminName: string;

  @Column()
  type: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
