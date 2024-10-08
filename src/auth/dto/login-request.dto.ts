import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ description: '사용자 이메일' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: '사용자 비밀번호' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: '로그인 유지 여부' })
  @IsNotEmpty()
  @IsBoolean()
  keepingLogin: boolean;

  @ApiPropertyOptional({ description: '기기 코드(없으면 새로 발급)' })
  @IsOptional()
  @IsString()
  deviceCode?: string;
}
