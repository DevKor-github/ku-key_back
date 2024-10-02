import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutRequestDto {
  @ApiProperty({ description: '기기 코드 (없으면 모든 기기 로그아웃)' })
  @IsOptional()
  @IsString()
  deviceCode?: string;
}