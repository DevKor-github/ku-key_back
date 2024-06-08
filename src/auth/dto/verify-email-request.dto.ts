import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyEmailRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({ description: '사용자 이메일' })
  email: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: '인증번호' })
  verifyToken: number;
}
