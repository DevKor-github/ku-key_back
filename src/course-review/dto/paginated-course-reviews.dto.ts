import { ApiProperty } from '@nestjs/swagger';
import { SearchCourseReviewsWithKeywordResponse } from './search-course-reviews-with-keyword-response.dto';

export class PaginatedCourseReviewsDto {
  static readonly LIMIT = 11;

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  @ApiProperty({ description: '다음 cursor id' })
  nextCursorId: number;

  @ApiProperty({
    description: '강의평 리스트',
    type: [SearchCourseReviewsWithKeywordResponse],
  })
  data: SearchCourseReviewsWithKeywordResponse[];

  constructor(
    searchCourseReviewsWithKeywordResponse: SearchCourseReviewsWithKeywordResponse[],
  ) {
    const hasNextPage = searchCourseReviewsWithKeywordResponse.length === 11;
    const nextCursorId = hasNextPage
      ? searchCourseReviewsWithKeywordResponse[9].id
      : null;

    this.hasNextPage = hasNextPage;
    this.nextCursorId = nextCursorId;
    this.data = hasNextPage
      ? searchCourseReviewsWithKeywordResponse.slice(0, 10)
      : searchCourseReviewsWithKeywordResponse;
  }
}
