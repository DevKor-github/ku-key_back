import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateCourseReviewRequestDto {
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

  @ApiProperty({ description: '강의평 남기기' })
  @IsString()
  @IsNotEmpty()
  @Length(50, 1000)
  textReview: string;

  @ApiProperty({ description: '연도' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ description: '학기' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: '교수님 성함' })
  @IsString()
  @IsNotEmpty()
  @Length(3)
  professorName: string;

  @ApiProperty({ description: '학수번호' })
  @IsString()
  @IsNotEmpty()
  @Length(7)
  courseCode: string;
}
