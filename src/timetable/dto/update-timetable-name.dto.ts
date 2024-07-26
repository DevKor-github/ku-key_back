import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateTimetableNameDto {
  @ApiProperty({ description: '시간표 이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  timetableName: string;
}
