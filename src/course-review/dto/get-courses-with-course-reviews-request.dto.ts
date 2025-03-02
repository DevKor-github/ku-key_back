import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { CourseReviewCriteria } from 'src/enums/course-review-criteria.enum';

export class GetCoursesWithCourseReviewsRequestDto {
  @ApiProperty({ description: '반환 개수' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  limit: number;

  @ApiProperty({ description: '반환 기준', enum: CourseReviewCriteria })
  @IsEnum(CourseReviewCriteria)
  @IsNotEmpty()
  criteria: CourseReviewCriteria;
}
