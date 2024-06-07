import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendTempPasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({ description: '임시비밀번호를 발급받고자 하는 계정의 이메일' })
  email: string;
}

export class SendTempPasswordResponseDto {
  constructor(sended: boolean) {
    this.sended = sended;
  }
  @ApiProperty({ description: '임시비밀번호 발송 여부' })
  sended: boolean;
}
