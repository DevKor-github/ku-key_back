import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CommonCourseDetailResponseDto {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '요일' })
  @IsString()
  @IsOptional()
  day: string;

  @ApiProperty({ description: '시작 시간' })
  @IsString()
  @IsOptional()
  startTime: string;

  @ApiProperty({ description: '종료 시간' })
  @IsString()
  @IsOptional()
  endTime: string;

  @ApiProperty({ description: '강의실' })
  @IsString()
  @IsOptional()
  classroom: string;

  @ApiProperty({ description: '교시' })
  @IsString()
  @IsOptional()
  period: string;

  @ApiProperty({ description: '강의 ID' })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
