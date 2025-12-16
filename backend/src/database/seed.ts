import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Check if admin user already exists
    const adminExists = await usersService.findByEmail('admin@example.com');
    
    if (!adminExists) {
      // Create admin user
      await usersService.create({
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: Role.ADMIN,
      });
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists.');
    }

    // Add more seed data here if needed
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();