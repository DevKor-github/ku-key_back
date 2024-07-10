import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';

export class CreateCourseReviewRequestDto {
  @ApiProperty({ description: '강의 평점', minimum: 1, maximum: 5 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rate: number;

  @ApiProperty({ description: '수업 난이도', minimum: 1, maximum: 3 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(3)
  classLevel: number;

  @ApiProperty({ description: '팀 프로젝트 난이도', minimum: 1, maximum: 4 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(4)
  teamProject: number;

  @ApiProperty({ description: '학습량', minimum: 1, maximum: 3 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(3)
  amountLearned: number;

  @ApiProperty({ description: '교수님 강의력', minimum: 1, maximum: 5 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  teachingSkills: number;

  @ApiProperty({ description: '출석체크 여부', minimum: 1, maximum: 3 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(3)
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
