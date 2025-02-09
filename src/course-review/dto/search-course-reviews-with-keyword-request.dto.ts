import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class SearchCourseReviewsWithKeywordRequest {
  @ApiProperty({
    description: '검색 키워드 (교수명, 강의명, 학수번호 중 하나)',
  })
  @IsString()
  @Length(2)
  keyword: string;

  @ApiPropertyOptional({
    description: 'cursor id, 값이 존재하지 않으면 첫 페이지',
  })
  @IsInt()
  @IsOptional()
  cursorId?: number;
}
