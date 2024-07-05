import { ApiProperty } from '@nestjs/swagger';

export class GetCourseReviewSummaryResponseDto {
  @ApiProperty({ description: '토탈 평점' })
  totalRate: number;

  @ApiProperty({ description: '리뷰 개수' })
  reviewCount: number;

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
