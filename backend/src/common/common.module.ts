import { Module, Global } from '@nestjs/common';
import { PusherService } from './services/pusher.service';

@Global()
@Module({
  providers: [PusherService],
  exports: [PusherService],
})
export class CommonModule {}