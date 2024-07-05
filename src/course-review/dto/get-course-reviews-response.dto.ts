import { ApiProperty } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty({ description: '평점' })
  rate: number;

  @ApiProperty({ description: '연도' })
  year: string;

  @ApiProperty({ description: '학기' })
  semester: string;

  @ApiProperty({ description: '추천수' })
  recommended: number;

  @ApiProperty({ description: '강의평' })
  text: string;
}

export class GetCourseReviewsResponseDto {
  @ApiProperty({ description: '총 평점' })
  totalRate: number;

  @ApiProperty({ description: '리뷰 개수' })
  reviewCount: number;

  @ApiProperty({ description: '리뷰 목록', type: [ReviewDto] })
  reviews: ReviewDto[];
}
