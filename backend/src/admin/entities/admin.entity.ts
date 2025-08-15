import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, eager: true })
  @JoinColumn()
  user: User;

 
}
