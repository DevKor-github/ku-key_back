import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsNotEmpty, ValidateIf } from 'class-validator';
import { ItemCategory } from 'src/enums/item-category.enum';

export class PurchaseItemRequestDto {
  @ApiProperty({ description: '요구 포인트' })
  @IsNotEmpty()
  @IsInt()
  requiredPoints: number;

  @ApiProperty({ enum: ItemCategory, description: '아이템 카테고리' })
  @IsNotEmpty()
  @IsEnum(ItemCategory)
  itemCategory: ItemCategory;

  @ApiProperty({
    description: '열람 일수 (강의평 열람권 구매 시에만)',
    required: false,
    enum: [3, 7, 30],
  })
  @ValidateIf(
    (o) => o.itemCategory === ItemCategory.COURSE_REVIEW_READING_TICKET,
  )
  @IsNotEmpty()
  @IsInt()
  @IsIn([3, 7, 30])
  days?: number;
}
