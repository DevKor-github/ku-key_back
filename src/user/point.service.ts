import { EntityManager } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CharacterEvolutionMetadata,
  CourseReviewMetadata,
  PurchaseItemRequestDto,
} from './dto/purchase-item-request.dto';
import { UserService } from './user.service';
import { UserEntity } from 'src/entities/user.entity';
import { ItemCategory } from 'src/enums/item-category.enum';
import { PurchaseItemResponseDto } from './dto/purchase-item-response-dto';

@Injectable()
export class PointService {
  constructor(private readonly userSerivce: UserService) {}

  async purchaseItem(
    transactionManager: EntityManager,
    userId: number,
    requestDto: PurchaseItemRequestDto,
  ): Promise<PurchaseItemResponseDto> {
    const user = await transactionManager.findOne(UserEntity, {
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('유저 정보를 찾을 수 없습니다.');
    }

    const { requiredPoints, itemCategory, itemMetadata } = requestDto;
    const responseDto = new PurchaseItemResponseDto();
    let historyDescription: string = '';

    if (itemCategory === ItemCategory.COURSE_REVIEW_READING_TICKET) {
      const { days } = itemMetadata as CourseReviewMetadata;
      responseDto.viewableUntil = await this.userSerivce.updateViewableUntil(
        transactionManager,
        userId,
        days,
      );
      historyDescription = `Reading course reviews - ${days} days`;
    } else if (itemCategory === ItemCategory.CHARACTER_EVOLUTION) {
      const { level } = itemMetadata as CharacterEvolutionMetadata;
      responseDto.upgradeLevel = await this.userSerivce.upgradeUserCharacter(
        transactionManager,
        userId,
        level,
      );
      historyDescription = `Evolving characters level ${level}`;
    } else {
      responseDto.newCharacterType =
        await this.userSerivce.changeUserCharacterType(
          transactionManager,
          userId,
        );
      historyDescription = `Changing character types`;
    }

    await this.userSerivce.changePoint(
      userId,
      -1 * requiredPoints,
      historyDescription,
      transactionManager,
    );

    return responseDto;
  }
}
