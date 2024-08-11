import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyScreenshotRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ description: '요청을 승인할지 거절할지 여부' })
  verify: boolean;
}
