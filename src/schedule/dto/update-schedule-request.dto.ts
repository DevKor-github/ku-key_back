import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { IsTime } from 'src/decorators/time.decorator';

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

export class UpdateScheduleRequestDto {
  @ApiProperty({ description: '시간표 ID' })
  @IsNumber()
  @IsNotEmpty()
  timetableId: number;

  @ApiPropertyOptional({ description: '일정 이름' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiPropertyOptional({ description: '요일' })
  @ValidateIf((o) => o.day || o.startTime || o.endTime)
  @IsEnum(DayType)
  @IsNotEmpty()
  day: DayType;

  @ApiPropertyOptional({ description: '시작 시간' })
  @ValidateIf((o) => o.day || o.startTime || o.endTime)
  @IsTime()
  @IsNotEmpty()
  startTime: string;

  @ApiPropertyOptional({ description: '종료 시간' })
  @ValidateIf((o) => o.day || o.startTime || o.endTime)
  @IsTime()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ description: '장소' })
  @IsString()
  @IsOptional()
  location: string;
}
