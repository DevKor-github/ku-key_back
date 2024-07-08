import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

const CriteriaType = {
  createdAt: 'createdAt',
  recommended: 'recommended',
  rate: 'rate',
} as const;

const DirectionType = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type CriteriaType = (typeof CriteriaType)[keyof typeof CriteriaType];
export type DirectionType = (typeof DirectionType)[keyof typeof DirectionType];

export class CourseReviewsFilterDto {
  @ApiProperty({ description: '검색 필터 기준' })
  @IsEnum(CriteriaType)
  @IsNotEmpty()
  criteria: CriteriaType = CriteriaType.createdAt;

  @ApiProperty({ description: '오름차순 / 내림차순' })
  @IsEnum(DirectionType)
  @IsNotEmpty()
  direction: DirectionType = DirectionType.DESC;
}
