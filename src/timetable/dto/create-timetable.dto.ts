import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TimetableDto } from './timetable.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimetableDto extends TimetableDto {
  @ApiProperty({ description: '시간표 이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  timetableName: string;
}
