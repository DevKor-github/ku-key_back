import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

const ColorType = {
  Red: 'Red',
  Blue: 'Blue',
  Green: 'Green',
  Purple: 'Purple',
  Orange: 'Orange',
  Gray: 'Gray',
} as const;

export type ColorType = (typeof ColorType)[keyof typeof ColorType];

export class UpdateTimetableColorDto {
  @ApiProperty({ description: '시간표 색상' })
  @IsEnum(ColorType)
  @IsNotEmpty()
  timetableColor: ColorType;
}
