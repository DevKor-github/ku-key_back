import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SearchCourseDto {
  @ApiProperty({ description: '학수 번호' })
  @IsString()
  @Length(7)
  courseCode: string;

  @ApiProperty({ description: '강의명' })
  @IsString()
  @Length(3)
  courseName: string;

  @ApiProperty({ description: '교수님 성함' })
  @IsString()
  @Length(3)
  professorName: string;

  @ApiProperty({ description: '검색 키워드 (강의명, 교수명, 학수번호)' })
  @IsString()
  @Length(3)
  @IsNotEmpty()
  keyword: string;

  @ApiPropertyOptional({
    description: 'cursor id, 값이 존재하지 않으면 첫 페이지',
  })
  @IsInt()
  @IsOptional()
  cursorId?: number;

  @ApiProperty({ description: '연도' })
  @IsString()
  @Length(4)
  year: string;

  @ApiProperty({ description: '학기' })
  @IsString()
  @Length(1)
  semester: string;
}
