import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TimeTableDto } from './timetable.dto';

export class CreateTimeTableDto extends TimeTableDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  tableName: string;
}
