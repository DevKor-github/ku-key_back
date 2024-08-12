import { ApiProperty } from '@nestjs/swagger';
import { DayType } from 'src/common/types/day-type.utils';

export class GetScheduleInfoByTimetableIdResponseDto {
  @ApiProperty({ description: '일정 ID' })
  scheduleId: number;

  @ApiProperty({ description: '일정 이름' })
  scheduleTitle: string;

  @ApiProperty({ description: '일정 시작 시간' })
  scheduleStartTime: string;

  @ApiProperty({ description: '일정 종료 시간' })
  scheduleEndTime: string;

  @ApiProperty({ description: '일정 장소' })
  location: string;

  @ApiProperty({ description: '일정 요일' })
  scheduleDay: DayType;
}
