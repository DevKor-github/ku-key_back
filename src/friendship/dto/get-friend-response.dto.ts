import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class getFriendResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  major: string;

  @IsString()
  @IsOptional()
  language: string;
}
