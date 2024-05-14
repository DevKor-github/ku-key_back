import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTimeTableDto {
  @IsString()
  @IsNotEmpty()
  semester: string;

  @IsString()
  @IsNotEmpty()
  year: string;
}
