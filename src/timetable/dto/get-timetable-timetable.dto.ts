import { ApiPropertyOptional } from '@nestjs/swagger';
import { GetCourseInfoByTimeTableIdResponseDto } from './get-courseinfo-timetable.dto';
import { GetScheduleInfoByTimeTableIdResponseDto } from './get-scheduleinfo-timetable.dto';

export class GetTimeTableByTimeTableIdDto {
  @ApiPropertyOptional({ type: [GetCourseInfoByTimeTableIdResponseDto] })
  courses?: GetCourseInfoByTimeTableIdResponseDto[];

  @ApiPropertyOptional({ type: [GetScheduleInfoByTimeTableIdResponseDto] })
  schedules?: GetScheduleInfoByTimeTableIdResponseDto[];
}
