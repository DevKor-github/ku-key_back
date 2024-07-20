import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthorizedUserDto {
  constructor(id: number, username: string, keepingLogin?: boolean) {
    this.id = id;
    this.username = username;
    this.keepingLogin = keepingLogin;
  }

  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsBoolean()
  keepingLogin?: boolean;
}
