import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetFriendResponseDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

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
