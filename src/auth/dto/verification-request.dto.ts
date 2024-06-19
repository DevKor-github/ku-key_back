import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerificationRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({ description: '사용자 이메일' })
  email: string;
}
