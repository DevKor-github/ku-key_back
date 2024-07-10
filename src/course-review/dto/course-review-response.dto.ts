import { ApiProperty } from '@nestjs/swagger';

export class CourseReviewResponseDto {
  @ApiProperty({ description: 'id' })
  id: number;

  @ApiProperty({ description: '작성자' })
  reviewer: string;

  @ApiProperty({ description: '작성일' })
  createdAt: Date;

  @ApiProperty({ description: '강의 평점' })
  rate: number;

  @ApiProperty({ description: '수업 난이도' })
  classLevel: number;

  @ApiProperty({ description: '팀 프로젝트 난이도' })
  teamProject: number;

  @ApiProperty({ description: '학습량' })
  amountLearned: number;

  @ApiProperty({ description: '교수님 강의력' })
  teachingSkills: number;

  @ApiProperty({ description: '출석체크 여부' })
  attendance: number;

  @ApiProperty({ description: '추천수' })
  recommendCount: number;

  @ApiProperty({ description: '강의평 남기기' })
  textReview: string;

  @ApiProperty({ description: '해당 강의 교수님 성함' })
  professorName: string;

  @ApiProperty({ description: '해당 강의 연도' })
  year: string;

  @ApiProperty({ description: '해당 강의 학기' })
  semester: string;

  @ApiProperty({ description: '해당 강의 학수번호' })
  courseCode: string;

  @ApiProperty({ description: '강의평 작성한 유저 ID' })
  userId: number;
}
