import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ToBoolean } from 'src/decorators/to-boolean.decorator';

export class ClubSearchQueryDto {
  @IsOptional()
  @ToBoolean()
  @ApiPropertyOptional({ description: '찜 필터링 여부 (true / false)' })
  like?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '카테고리 종류' })
  category?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Keyword 필드는 최소 2자 이상이어야 합니다.' })
  @ApiPropertyOptional({ description: '동아리명 / 동아리 요약 검색어' })
  keyword?: string;
}
