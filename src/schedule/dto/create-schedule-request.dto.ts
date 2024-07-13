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

export class CreateScheduleRequestDto {
  @ApiProperty({ description: '시간표 ID' })
  @IsNumber()
  @IsNotEmpty()
  timetableId: number;

  @ApiProperty({ description: '일정 이름' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '요일' })
  @IsEnum(DayType)
  @IsNotEmpty()
  day: DayType;

  @ApiProperty({ description: '시작 시간' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: '종료 시간' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: '장소' })
  @IsString()
  @IsOptional()
  location: string;
}
