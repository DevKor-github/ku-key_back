import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendTempPasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class SendTempPasswordResponseDto {
  constructor(sended: boolean) {
    this.sended = sended;
  }
  sended: boolean;
}
