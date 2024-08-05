import { ApiProperty } from '@nestjs/swagger';
import { CourseReviewEntity } from 'src/entities/course-review.entity';

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

  constructor(courseReviewEntity: CourseReviewEntity, username: string) {
    this.id = courseReviewEntity.id;
    this.reviewer = username;
    this.createdAt = courseReviewEntity.createdAt;
    this.rate = courseReviewEntity.rate;
    this.classLevel = courseReviewEntity.classLevel;
    this.teamProject = courseReviewEntity.teamProject;
    this.amountLearned = courseReviewEntity.amountLearned;
    this.teachingSkills = courseReviewEntity.teachingSkills;
    this.attendance = courseReviewEntity.attendance;
    this.recommendCount = courseReviewEntity.recommendCount;
    this.textReview = courseReviewEntity.textReview;
    this.professorName = courseReviewEntity.professorName;
    this.year = courseReviewEntity.year;
    this.semester = courseReviewEntity.semester;
    this.courseCode = courseReviewEntity.courseCode;
    this.userId = courseReviewEntity.userId;
  }
}
