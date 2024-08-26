import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DayType } from 'src/common/types/day-type.utils';
import { IsTime } from 'src/decorators/time.decorator';

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
  @IsTime()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: '종료 시간' })
  @IsTime()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: '장소' })
  @IsString()
  @IsOptional()
  location: string;
}
