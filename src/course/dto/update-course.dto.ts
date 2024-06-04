import { ApiProperty } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty({ description: '교수 이름' })
  @IsOptional()
  professorName?: string;

  @ApiProperty({ description: '강의 구분' })
  @IsOptional()
  category?: string;

  @ApiProperty({ description: '단과대 이름' })
  @IsOptional()
  college?: string;

  @ApiProperty({ description: '강의명' })
  @IsOptional()
  courseName?: string;

  @ApiProperty({ description: '학수 번호' })
  @IsOptional()
  courseCode?: string;

  @ApiProperty({ description: '학점' })
  @IsOptional()
  credit?: number;

  @ApiProperty({ description: '학과 이름' })
  @IsOptional()
  major?: string;

  @ApiProperty({ description: '교환학생 수강 가능 여부' })
  @IsOptional()
  hasExchangeSeat?: boolean;

  @ApiProperty({ description: '연도' })
  @IsOptional()
  year?: string;

  @ApiProperty({ description: '학기' })
  @IsOptional()
  semester: string;
}
