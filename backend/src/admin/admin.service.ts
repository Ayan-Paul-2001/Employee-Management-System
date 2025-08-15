import { Injectable, NotFoundException, ConflictException , BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/entities/user.entity'; 


@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

}
