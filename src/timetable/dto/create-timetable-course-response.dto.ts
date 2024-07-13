import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTimetableCourseResponseDto {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '시간표 ID' })
  @IsNumber()
  @IsNotEmpty()
  timetableId: number;

  @ApiProperty({ description: '강의 ID' })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
