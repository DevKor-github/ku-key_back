import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AuthorizedUserDto {
  constructor(id: number, username: string) {
    this.id = id;
    this.username = username;
  }

  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  username: string;
}
