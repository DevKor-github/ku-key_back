import { ApiProperty } from '@nestjs/swagger';

export class SearchCourseReviewsWithKeywordResponse {
  @ApiProperty({ description: '리뷰 id' })
  id: number;

  @ApiProperty({ description: '총 평점' })
  totalRate: number;

  @ApiProperty({ description: '리뷰 개수' })
  reviewCount: number;

  @ApiProperty({ description: '과목명' })
  courseName: string;

  @ApiProperty({ description: '교수명' })
  professorName: string;
}
