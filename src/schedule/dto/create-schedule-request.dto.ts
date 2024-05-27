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
} as const;

export type DayType = (typeof DayType)[keyof typeof DayType];

export class CreateScheduleRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(DayType)
  @IsNotEmpty()
  day: DayType;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsOptional()
  location: string;
}
