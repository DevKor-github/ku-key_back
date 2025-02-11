import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseEntity } from 'src/entities/course.entity';
import { ScheduleEntity } from 'src/entities/schedule.entity';

// 대표시간표의 오늘 수업 + 일정
export class TodayCourseDto {
  @ApiProperty({ description: '강의 이름' })
  courseName: string;

  @ApiProperty({ description: '교수님 성함' })
  professorName: string;

  @ApiPropertyOptional({ description: '강의실' })
  classroom?: string;

  @ApiPropertyOptional({ description: '시작 시간' })
  startTime?: string;

  @ApiPropertyOptional({ description: '종료 시간' })
  endTime?: string;
}

export class TodayScheduleDto {
  @ApiProperty({ description: '일정 이름' })
  scheduleName: string;

  @ApiProperty({ description: '시작 시간' })
  startTime: string;

  @ApiProperty({ description: '종료 시간' })
  endTime: string;

  @ApiPropertyOptional({ description: '위치' })
  location?: string;
}

export class GetTodayTimetableResponse {
  @ApiPropertyOptional({
    type: [TodayCourseDto],
    description: '오늘의 강의 목록',
  })
  courses?: TodayCourseDto[];

  @ApiPropertyOptional({
    type: [TodayScheduleDto],
    description: '오늘의 일정 목록',
  })
  schedules?: TodayScheduleDto[];

  constructor(courses: TodayCourseDto[], schedules: TodayScheduleDto[]) {
    this.courses = courses;
    this.schedules = schedules;
  }
}
