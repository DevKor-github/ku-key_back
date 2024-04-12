import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyEmailRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  verifyToken: number;
}
