import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({ description: '인증완료된 사용자 이메일' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '사용자 비밀번호' })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '중복확인 완료된 userId' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '본명' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '국적' })
  country: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '모교' })
  homeUniversity: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '전공' })
  major: string;
}
