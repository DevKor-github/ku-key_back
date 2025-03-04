import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ClubCategory } from 'src/common/types/club-category-type';
import { ToBoolean } from 'src/decorators/to-boolean.decorator';

export class GetClubRequestDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '정렬 방식' })
  sortBy?: string;

  @IsOptional()
  @ToBoolean()
  @ApiPropertyOptional({ description: '좋아요 필터링 여부 (true / false)' })
  wishList?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(ClubCategory)
  @ApiPropertyOptional({ description: '카테고리 종류', enum: ClubCategory })
  category?: ClubCategory;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Keyword 필드는 최소 2자 이상이어야 합니다.' })
  @ApiPropertyOptional({ description: '동아리명 / 동아리 요약 검색어' })
  keyword?: string;

  @IsNotEmpty()
  @ToBoolean()
  @IsBoolean()
  @ApiProperty({ description: '로그인 여부' })
  isLogin: boolean;
}
