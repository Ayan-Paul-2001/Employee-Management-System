import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(EmployeeProfile)
    private employeeProfileRepository: Repository<EmployeeProfile>,
    private usersService: UsersService,
  ) {}

  async create(createEmployeeProfileDto: CreateEmployeeProfileDto): Promise<EmployeeProfile> {
    console.log('Creating employee profile with DTO:', createEmployeeProfileDto);
    
    // Check if employee ID already exists
    const existingEmployee = await this.employeeProfileRepository.findOne({
      where: { employeeId: createEmployeeProfileDto.employeeId },
    });

    if (existingEmployee) {
      throw new ConflictException(`Employee with ID ${createEmployeeProfileDto.employeeId} already exists`);
    }

    try {
      // Check if user exists
      await this.usersService.findOne(createEmployeeProfileDto.userId);
      
      // Create and save the employee profile
      const newEmployeeProfile = this.employeeProfileRepository.create(createEmployeeProfileDto);
      const savedProfile = await this.employeeProfileRepository.save(newEmployeeProfile);
      console.log('Successfully created employee profile:', savedProfile);
      return savedProfile;
    } catch (error) {
      console.error('Error creating employee profile:', error);
      throw error;
    }
  }

  async findAll(): Promise<EmployeeProfile[]> {
    return this.employeeProfileRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number | string): Promise<EmployeeProfile> {
    const employeeProfile = await this.employeeProfileRepository.findOne({
      where: { id: typeof id === 'string' ? parseInt(id) : id },
      relations: ['user'],
    });

    if (!employeeProfile) {
      throw new NotFoundException(`Employee profile with ID ${id} not found`);
    }

    return employeeProfile;
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeProfile> {
    const employeeProfile = await this.employeeProfileRepository.findOne({
      where: { employeeId },
      relations: ['user'],
    });

    if (!employeeProfile) {
      throw new NotFoundException(`Employee profile with employee ID ${employeeId} not found`);
    }

    return employeeProfile;
  }

  async findByUserId(userId: number): Promise<EmployeeProfile> {
    const employeeProfile = await this.employeeProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!employeeProfile) {
      throw new NotFoundException(`Employee profile for user ID ${userId} not found`);
    }

    return employeeProfile;
  }

  async update(id: number, updateEmployeeProfileDto: UpdateEmployeeProfileDto): Promise<EmployeeProfile> {
    const employeeProfile = await this.findOne(id);

    // Check if employeeId is being updated and if it already exists
    if (
      updateEmployeeProfileDto.employeeId &&
      updateEmployeeProfileDto.employeeId !== employeeProfile.employeeId
    ) {
      const existingEmployee = await this.employeeProfileRepository.findOne({
        where: { employeeId: updateEmployeeProfileDto.employeeId },
      });

      if (existingEmployee) {
        throw new ConflictException(`Employee with ID ${updateEmployeeProfileDto.employeeId} already exists`);
      }
    }

    // Update employee profile properties
    Object.assign(employeeProfile, updateEmployeeProfileDto);

    return this.employeeProfileRepository.save(employeeProfile);
  }

  async remove(id: number): Promise<void> {
    const employeeProfile = await this.findOne(id);
    await this.employeeProfileRepository.remove(employeeProfile);
  }
}