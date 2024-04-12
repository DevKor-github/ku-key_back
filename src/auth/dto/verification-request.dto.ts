import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerificationRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
