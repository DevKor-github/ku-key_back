import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

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

export class GetTimeTableByTimeTableIdResponseDto {
  @ApiProperty({ description: '교수님 성함' })
  @IsString()
  @IsNotEmpty()
  professorName: string;

  @ApiProperty({ description: '강의명' })
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @ApiProperty({ description: '학수 번호' })
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @ApiProperty({ description: '시작 시간' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: '종료 시간' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: '강의실' })
  @IsString()
  @IsNotEmpty()
  classroom: string;

  @ApiProperty({ description: '요일' })
  @IsEnum(DayType)
  @IsNotEmpty()
  day: DayType;
}
