import { ApiProperty } from '@nestjs/swagger';
import { CreateCourseDetailDto } from './create-course-detail.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateCourseDetailDto extends PartialType(CreateCourseDetailDto) {
  @ApiProperty({ description: '강의 ID' })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({ description: '요일' })
  @IsOptional()
  day?: string;

  @ApiProperty({ description: '시작 시간' })
  @IsOptional()
  startTime?: string;

  @ApiProperty({ description: '종료 시간' })
  @IsOptional()
  endTime?: string;

  @ApiProperty({ description: '강의실' })
  @IsOptional()
  classroom?: string;

  @ApiProperty({ description: '교시' })
  @IsOptional()
  period?: string;
}
