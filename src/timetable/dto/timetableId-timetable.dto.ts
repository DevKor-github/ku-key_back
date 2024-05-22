import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

const DayType = {
  Mon: 'Mon',
  Tue: 'Tue',
  Wed: 'Wed',
  Thu: 'Thu',
  Fri: 'Fri',
} as const;

export type DayType = (typeof DayType)[keyof typeof DayType];

export class GetTimeTableByTimeTableIdResponseDto {
  @IsString()
  @IsNotEmpty()
  professorName: string;

  @IsString()
  @IsNotEmpty()
  courseName: string;

  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  classroom: string;

  @IsEnum(DayType)
  @IsNotEmpty()
  day: DayType;
}
