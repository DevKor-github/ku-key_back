import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class SearchCourseDto {
  @ApiPropertyOptional({ description: '학수 번호' })
  @IsString()
  @Length(7)
  @IsOptional()
  courseCode?: string;

  @ApiPropertyOptional({ description: '강의명' })
  @IsString()
  @Length(2)
  @IsOptional()
  courseName?: string;

  @ApiPropertyOptional({ description: '교수님 성함' })
  @IsString()
  @Length(3)
  @IsOptional()
  professorName?: string;
}
