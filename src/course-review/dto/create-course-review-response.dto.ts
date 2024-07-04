import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCourseReviewResponseDto {
  @ApiProperty({ description: 'id' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '강의 평점' })
  @IsNumber()
  @IsNotEmpty()
  rate: number;

  @ApiProperty({ description: '수업 난이도' })
  @IsNumber()
  @IsNotEmpty()
  classLevel: number;

  @ApiProperty({ description: '팀 프로젝트 난이도' })
  @IsNumber()
  @IsNotEmpty()
  teamProject: number;

  @ApiProperty({ description: '학습량' })
  @IsNumber()
  @IsNotEmpty()
  amountLearned: number;

  @ApiProperty({ description: '교수님 강의력' })
  @IsNumber()
  @IsNotEmpty()
  teachingSkills: number;

  @ApiProperty({ description: '출석체크 여부' })
  @IsNumber()
  @IsNotEmpty()
  attendance: number;

  @ApiProperty({ description: '추천 여부' })
  @IsBoolean()
  @IsNotEmpty()
  recommended: boolean;

  @ApiProperty({ description: '강의평 남기기' })
  @IsString()
  @IsNotEmpty()
  textReview: string;

  @ApiProperty({ description: '해당 강의 교수님 성함' })
  @IsString()
  @IsNotEmpty()
  professorName: string;

  @ApiProperty({ description: '해당 강의 연도' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ description: '해당 강의 학기' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: '해당 강의 학수번호' })
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @ApiProperty({ description: '강의평 작성한 유저 ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
