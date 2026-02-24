import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';
import { Notice } from './entities/notice.entity';
import { UsersModule } from '../users/users.module';
import { PusherModule } from '../common/services/pusher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notice]),
    UsersModule,
    PusherModule,
  ],
  controllers: [NoticesController],
  providers: [NoticesService],
  exports: [NoticesService],
})
export class NoticesModule {}