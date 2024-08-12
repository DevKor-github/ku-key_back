import { ApiProperty } from '@nestjs/swagger';
import { DayType } from 'src/common/types/day-type.utils';

export class GetCourseInfoByTimetableIdResponseDto {
  @ApiProperty({ description: '강의 ID' })
  courseId: number;

  @ApiProperty({ description: '교수님 성함' })
  professorName: string;

  @ApiProperty({ description: '강의명' })
  courseName: string;

  @ApiProperty({ description: '학수 번호' })
  courseCode: string;

  @ApiProperty({ description: '강의 계획서' })
  syllabus: string;

  @ApiProperty({ description: '시작 시간' })
  startTime: string;

  @ApiProperty({ description: '종료 시간' })
  endTime: string;

  @ApiProperty({ description: '강의실' })
  classroom: string;

  @ApiProperty({ description: '요일' })
  day: DayType;
}
