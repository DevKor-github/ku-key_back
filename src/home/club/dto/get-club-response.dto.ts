import { ApiProperty } from '@nestjs/swagger';

export class GetClubResponseDto {
  @ApiProperty({ description: 'club table의 PK' })
  clubId: number;

  @ApiProperty({ description: '동아리명' })
  name: string;

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

  @ApiProperty({ description: '좋아요 여부' })
  isLiked: boolean;
}
