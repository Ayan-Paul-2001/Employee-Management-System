import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../common/enums/role.enum';
import { EmployeeProfile } from '../../employees/entities/employee-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true }) // Exclude from response
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.EMPLOYEE,
  })
  role: Role;

  @OneToOne(() => EmployeeProfile, (profile) => profile.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  employeeProfile: EmployeeProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  verificationToken: string;

  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpiry: Date;
}