import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TimeTableDto {
  @IsString()
  @IsNotEmpty()
  semester: string;

  @IsString()
  @IsNotEmpty()
  year: string;
}
