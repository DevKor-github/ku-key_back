import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { CourseCategory } from 'src/enums/course-category.enum';

export class SearchCourseNewDto {
  @ApiPropertyOptional({
    description: '커서 id, 값이 존재하지 않으면 첫 페이지',
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

  @ApiProperty({
    description: '강의 카테고리 (모든 강의, 전공, 교양, 학문의 기초)',
    enum: CourseCategory,
  })
  @IsEnum(CourseCategory)
  category: CourseCategory;

  @ApiPropertyOptional({
    description: '검색 키워드 (강의명, 교수명, 학수번호)',
  })
  @Length(2)
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description:
      'Major일때 major를, Academic Foundation일 때 college를 넣어주세요.',
  })
  @IsString()
  @IsOptional()
  classification?: string;
}
