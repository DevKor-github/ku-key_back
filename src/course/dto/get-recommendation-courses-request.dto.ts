import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetRecommendationCoursesRequestDto {
  @ApiProperty({ description: '반환 개수' })
  @IsInt()
  @IsNotEmpty()
  limit: number;
}
