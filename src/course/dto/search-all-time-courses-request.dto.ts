import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class SearchAllTimeCoursesRequestDto {
  @ApiProperty({ description: '검색 키워드 (강의명, 교수명, 학수번호)' })
  @IsString()
  @MinLength(2)
  keyword: string;

  @ApiPropertyOptional({
    description: '커서 id, 값이 존재하지 않으면 첫 페이지',
  })
  @IsInt()
  @IsOptional()
  cursorId?: number;
}
