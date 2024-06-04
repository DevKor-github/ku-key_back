import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateScheduleResponseDto {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '시간표 ID' })
  @IsNumber()
  @IsNotEmpty()
  timeTableId: number;

  @ApiProperty({ description: '일정 이름' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '요일' })
  @IsString()
  @IsNotEmpty()
  day: string;

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
  location: string;
}
