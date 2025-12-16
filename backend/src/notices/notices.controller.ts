import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('notices')
@Controller('notices')
@UseGuards(JwtAuthGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create notice (Admin/HR only)' })
  @ApiResponse({ status: 201, description: 'Notice created successfully' })
  create(@Body() createNoticeDto: CreateNoticeDto, @Request() req) {
    // Set the creator ID from the authenticated user
    createNoticeDto.createdById = req.user.id;
    return this.noticesService.create(createNoticeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notices' })
  findAll() {
    return this.noticesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notice by ID' })
  findOne(@Param('id') id: string) {
    return this.noticesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update notice (Admin/HR only)' })
  update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticesService.update(+id, updateNoticeDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete notice (Admin/HR only)' })
  remove(@Param('id') id: string) {
    return this.noticesService.remove(+id);
  }
}