import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CommonCourseResponseDto {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '교수 이름' })
  @IsString()
  @IsNotEmpty()
  professorName: string;

  @ApiProperty({ description: '강의 구분' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: '단과대 이름' })
  @IsString()
  @IsOptional()
  college?: string;

  @ApiProperty({ description: '강의명' })
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @ApiProperty({ description: '학수 번호' })
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @ApiProperty({ description: '학점' })
  @IsNumber()
  @IsNotEmpty()
  credit: number;

  @ApiProperty({ description: '학과 이름' })
  @IsString()
  @IsOptional()
  major?: string;

  @ApiProperty({ description: '교환학생 수강 가능 여부' })
  @IsBoolean()
  @IsNotEmpty()
  hasExchangeSeat: boolean;

  @ApiProperty({ description: '연도' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ description: '학기' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: '강의계획서 url' })
  @IsString()
  @IsNotEmpty()
  syllabus: string;
}
