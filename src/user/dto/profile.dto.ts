import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ProfileDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  homeUniversity: string;

  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsString()
  major: string;

  @IsNotEmpty()
  @IsDate()
  startDay: Date;

  @IsNotEmpty()
  @IsDate()
  endDay: Date;
}
