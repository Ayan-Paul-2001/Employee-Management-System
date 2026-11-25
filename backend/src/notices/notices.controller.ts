import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovedUserGuard } from '../common/guards/approved-user.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('notices')
@ApiBearerAuth()
@Controller('notices')
@UseGuards(JwtAuthGuard, ApprovedUserGuard, RolesGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Post a new notice (HR & Admin)' })
  create(@Body() dto: CreateNoticeDto, @Request() req) {
    return this.noticesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notices (All authenticated roles)' })
  findAll() {
    return this.noticesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notice by ID' })
  findOne(@Param('id') id: string) {
    return this.noticesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Update notice (HR & Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete notice (HR & Admin)' })
  remove(@Param('id') id: string) {
    return this.noticesService.remove(id);
  }
}
