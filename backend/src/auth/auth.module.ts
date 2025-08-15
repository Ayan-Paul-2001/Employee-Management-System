import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { StratrgiesModule } from './stratrgies/stratrgies.module';
import { StrategiesModule } from './strategies/strategies.module';

@Module({
  providers: [EmailService],
  imports: [StratrgiesModule, StrategiesModule]
})
export class AuthModule {}
