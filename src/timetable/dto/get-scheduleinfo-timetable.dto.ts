import { ApiProperty } from '@nestjs/swagger';

const DayType = {
  Mon: 'Mon',
  Tue: 'Tue',
  Wed: 'Wed',
  Thu: 'Thu',
  Fri: 'Fri',
  Sat: 'Sat',
  Sun: 'Sun',
} as const;

export type DayType = (typeof DayType)[keyof typeof DayType];

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
