import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GetCourseInfoByTimetableIdResponseDto } from './get-courseinfo-timetable.dto';
import { GetScheduleInfoByTimetableIdResponseDto } from './get-scheduleinfo-timetable.dto';

export class GetTimetableByTimetableIdDto {
  @ApiPropertyOptional({ type: [GetCourseInfoByTimetableIdResponseDto] })
  courses?: GetCourseInfoByTimetableIdResponseDto[];

  @ApiPropertyOptional({ type: [GetScheduleInfoByTimetableIdResponseDto] })
  schedules?: GetScheduleInfoByTimetableIdResponseDto[];

  @ApiProperty({ description: '시간표 색상' })
  color: string;
}
