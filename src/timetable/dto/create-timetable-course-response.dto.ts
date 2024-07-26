import { ApiProperty } from '@nestjs/swagger';

export class CreateTimetableCourseResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '시간표 ID' })
  timetableId: number;

  @ApiProperty({ description: '강의 ID' })
  courseId: number;
}
