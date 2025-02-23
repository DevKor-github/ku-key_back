import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetCoursesWithRecentCourseReviewsRequestDto {
  @ApiProperty({ description: '반환 개수' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  limit: number;
}
