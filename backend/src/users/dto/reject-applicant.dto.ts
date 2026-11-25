import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RejectApplicantDto {
  @ApiPropertyOptional({
    example: 'Position currently filled. Please check back next quarter.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
