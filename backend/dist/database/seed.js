"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../common/enums/role.enum");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
    try {
        const adminExists = await usersService.findByEmail('admin@example.com');
        if (!adminExists) {
            await usersService.create({
                fullName: 'Admin User',
                email: 'admin@example.com',
                password: 'Admin@123',
                role: role_enum_1.Role.ADMIN,
            });
            console.log('Admin user created successfully!');
        }
        else {
            console.log('Admin user already exists.');
        }
        console.log('Seed completed successfully!');
    }
    catch (error) {
        console.error('Seed failed:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed.js.map