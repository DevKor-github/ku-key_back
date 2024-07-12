import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTimetableNameDto {
  @ApiProperty({ description: '시간표 이름' })
  @IsString()
  @IsNotEmpty()
  timetableName: string;
}
