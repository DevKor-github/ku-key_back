import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubCategory } from 'src/common/types/club-category-type';
import { ClubEntity } from 'src/entities/club.entity';

export class GetClubResponseDto {
  @ApiProperty({ description: 'club table의 PK' })
  clubId: number;

  @ApiProperty({ description: '동아리명' })
  name: string;

  @ApiProperty({ description: '동아리 카테고리' })
  category: ClubCategory;

  @ApiProperty({ description: '동아리 요약' })
  summary: string;

  @ApiProperty({ description: '정기 모임' })
  regularMeeting: string;

  @ApiProperty({ description: '모집 기간' })
  recruitmentPeriod: string;

  @ApiProperty({ description: '동아리 설명' })
  description: string;

  @ApiProperty({ description: '동아리 사진 URL' })
  imageUrl: string;

  @ApiProperty({ description: '좋아요 개수' })
  likeCount: number;

  @ApiPropertyOptional({ description: '인스타그램 링크' })
  instagramLink: string;

  @ApiPropertyOptional({ description: '유튜브 링크' })
  youtubeLink: string;

  @ApiProperty({ description: '좋아요 여부' })
  isLiked: boolean;

  constructor(club: ClubEntity, isLiked: boolean) {
    this.clubId = club.id;
    this.name = club.name;
    this.category = club.category;
    this.summary = club.summary;
    this.regularMeeting = club.regularMeeting;
    this.recruitmentPeriod = club.recruitmentPeriod;
    this.description = club.description;
    this.imageUrl = club.imageUrl;
    this.likeCount = club.allLikes;
    this.instagramLink = club.instagramLink;
    this.youtubeLink = club.youtubeLink;
    this.isLiked = isLiked;
  }
}
