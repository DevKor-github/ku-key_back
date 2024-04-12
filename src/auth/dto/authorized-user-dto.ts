import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AuthorizedUserDto {
  constructor(id: number, email: string) {
    this.id = id;
    this.email = email;
  }

  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
