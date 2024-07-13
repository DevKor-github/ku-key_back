import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsNumber()
  @IsNotEmpty()
  scheduleId: number;

  @ApiProperty({ description: '일정 이름' })
  @IsString()
  @IsNotEmpty()
  scheduleTitle: string;

  @ApiProperty({ description: '일정 시작 시간' })
  @IsString()
  @IsNotEmpty()
  scheduleStartTime: string;

  @ApiProperty({ description: '일정 종료 시간' })
  @IsString()
  @IsNotEmpty()
  scheduleEndTime: string;

  @ApiProperty({ description: '일정 장소' })
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty({ description: '일정 요일' })
  @IsEnum(DayType)
  @IsNotEmpty()
  scheduleDay: DayType;
}
