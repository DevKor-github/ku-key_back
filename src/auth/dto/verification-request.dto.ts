import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerificationRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
