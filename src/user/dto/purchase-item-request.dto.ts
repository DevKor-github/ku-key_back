import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ItemCategory } from 'src/enums/item-category.enum';

export class CourseReviewMetadata {
  @ApiProperty({ description: '열람 일수', enum: [3, 7, 30] })
  @IsInt()
  days: number;
}

export class CharacterEvolutionMetadata {
  @ApiProperty({ description: '업그레이드 할 레벨', minimum: 2, maximum: 5 })
  @IsInt()
  level: number;
}

type ItemMetadataType =
  | CourseReviewMetadata
  | CharacterEvolutionMetadata
  | null;

@ApiExtraModels(CourseReviewMetadata, CharacterEvolutionMetadata)
export class PurchaseItemRequestDto {
  @ApiProperty({ description: '요구 포인트' })
  @IsNotEmpty()
  @IsInt()
  requiredPoints: number;

  @ApiProperty({ enum: ItemCategory, description: '아이템 카테고리' })
  @IsNotEmpty()
  @IsEnum(ItemCategory)
  itemCategory: ItemCategory;

  // Metadata field which can hold either type based on the item category
  @ApiPropertyOptional({
    description: '아이템 카테고리별 메타데이터',
    oneOf: [
      { $ref: getSchemaPath(CourseReviewMetadata) },
      { $ref: getSchemaPath(CharacterEvolutionMetadata) },
    ],
  })
  @ValidateIf(
    (o) =>
      o.itemCategory === ItemCategory.COURSE_REVIEW_READING_TICKET ||
      o.itemCategory === ItemCategory.CHARACTER_EVOLUTION,
  )
  @IsOptional()
  @IsObject()
  itemMetadata?: ItemMetadataType;
}
