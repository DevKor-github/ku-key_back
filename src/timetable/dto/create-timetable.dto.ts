import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TimeTableDto } from './timetable.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimeTableDto extends TimeTableDto {
  @ApiProperty({ description: '시간표 이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  tableName: string;
}
