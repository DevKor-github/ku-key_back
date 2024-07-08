import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

const OrderType = {
  recent: 'recent',
  recommend: 'recommend',
  rating: 'rating',
} as const;

const DirectionType = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];
export type DirectionType = (typeof DirectionType)[keyof typeof DirectionType];

export class CourseReviewsFilterDto {
  @ApiProperty({ description: '검색 필터 기준' })
  @IsEnum(OrderType)
  @IsNotEmpty()
  order: OrderType;

  @ApiProperty({ description: '오름차순 / 내림차순' })
  @IsEnum(DirectionType)
  @IsNotEmpty()
  direction: DirectionType;
}
