import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/role/role.decorator';
import { UserRole } from 'src/auth/role/role';

@Controller('notice')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @Role(UserRole.ADMIN)
  create(@Body() dto: CreateNoticeDto, @Req() req: any) {
    return this.noticeService.createNotice(dto, req.user.id);
  }

  @Get()
  getAll() {
    return this.noticeService.getAll();
  }

  @Get('my')
  @Role(UserRole.ADMIN)
  getByAdmin(@Req() req: any) {
    return this.noticeService.getByAdmin(req.user.id);
  }

  @Patch(':id')
  @Role(UserRole.ADMIN)
  update(
    @Param('id') id: number,
    @Body() dto: UpdateNoticeDto,
    @Req() req: any,
  ) {
    return this.noticeService.updateNotice(+id, req.user.id, dto);
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  delete(@Param('id') id: number, @Req() req: any) {
    return this.noticeService.deleteNotice(+id, req.user.id);
  }
}
