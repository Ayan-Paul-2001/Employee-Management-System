import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { NotificationsService } from './notifications.service.js';
import {
  AddMailRecipientDto,
  ToggleNotificationMailDto,
} from './dto/notification-mail.dto.js';

@ApiTags('notification-mail')
@ApiBearerAuth()
@Controller('notification-mail')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.HR)
export class NotificationMailController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get registration notification mail toggle & recipient list (HR only)' })
  getSettings() {
    return this.notificationsService.getMailSettings();
  }

  @Patch('toggle')
  @ApiOperation({ summary: 'Turn registration notification mail system ON or OFF (HR only)' })
  toggle(@Body() dto: ToggleNotificationMailDto, @Request() req) {
    return this.notificationsService.toggleMailSettings(dto.enabled, req.user.id);
  }

  @Post('recipients')
  @ApiOperation({ summary: 'Add an email address to receive registration alerts (HR only)' })
  addRecipient(@Body() dto: AddMailRecipientDto, @Request() req) {
    return this.notificationsService.addMailRecipient(
      dto.email,
      dto.label,
      req.user.id,
    );
  }

  @Delete('recipients')
  @ApiOperation({ summary: 'Remove an email address from registration alerts (HR only)' })
  removeRecipient(@Query('email') email: string, @Request() req) {
    return this.notificationsService.removeMailRecipient(email, req.user.id);
  }

  @Post('test')
  @ApiOperation({ summary: 'Send a test registration alert email to configured recipients (HR only)' })
  sendTest() {
    return this.notificationsService.sendTestRegistrationMail();
  }
}
