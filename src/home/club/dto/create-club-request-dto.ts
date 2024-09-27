import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ClubCategory } from 'src/common/types/club-category-type';

export class CreateClubRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '동아리명' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '카테고리' })
  category: ClubCategory;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '동아리 요약' })
  summary: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '정기 모임' })
  regularMeeting: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '모집 기간' })
  recruitmentPeriod: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '동아리 설명' })
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '동아리 이미지 파일',
  })
  clubImage: any;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '인스타그램 링크' })
  instagramLink: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '유튜브 링크' })
  youtubeLink: string;
}
