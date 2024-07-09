import { ApiProperty } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty({ description: '강의평 ID' })
  id: number;

  @ApiProperty({ description: '평점' })
  rate: number;

  @ApiProperty({ description: '작성 일시' })
  createdAt: Date;

  @ApiProperty({ description: '작성자' })
  reviewer: string;

  @ApiProperty({ description: '연도' })
  year: string;

  @ApiProperty({ description: '학기' })
  semester: string;

  @ApiProperty({ description: '추천 여부' })
  myRecommend: boolean;

  @ApiProperty({ description: '추천수' })
  recommendCount: number;

  @ApiProperty({ description: '강의평 텍스트' })
  text: string;

  @ApiProperty({ description: '수업 난이도' })
  classLevel: number;

  @ApiProperty({ description: '팀 프로젝트 난이도' })
  teamProject: number;

  @ApiProperty({ description: '학습량' })
  amountLearned: number;

  @ApiProperty({ description: '교수님 강의력' })
  teachingSkills: number;

  @ApiProperty({ description: '출석 체크 방식' })
  attendance: number;
}

export class GetCourseReviewsResponseDto {
  @ApiProperty({ description: '총 평점' })
  totalRate: number;

  @ApiProperty({ description: '리뷰 개수' })
  reviewCount: number;

  @ApiProperty({ description: '리뷰 목록', type: [ReviewDto] })
  reviews: ReviewDto[];
}
