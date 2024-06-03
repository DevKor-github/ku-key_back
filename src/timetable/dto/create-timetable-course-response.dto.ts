import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTimeTableCourseResponseDto {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '시간표 ID' })
  @IsNumber()
  @IsNotEmpty()
  timeTableId: number;

  @ApiProperty({ description: '강의 ID' })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
