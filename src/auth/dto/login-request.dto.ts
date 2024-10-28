import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

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
}
