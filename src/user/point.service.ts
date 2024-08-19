import { EntityManager, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseItemRequestDto } from './dto/purchase-item-request.dto';
import { UserService } from './user.service';
import { UserEntity } from 'src/entities/user.entity';
import { ItemCategory } from 'src/enums/item-category.enum';
import { PurchaseItemResponseDto } from './dto/purchase-item-response-dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { GetPointHistoryResponseDto } from './dto/get-point-history.dto';
import { PointHistoryEntity } from 'src/entities/point-history.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RequiredPoints } from 'src/common/types/required-points';
import { CharacterEntity } from 'src/entities/character.entity';

@Injectable()
export class PointService {
  constructor(
    private readonly userSerivce: UserService,
    @InjectRepository(PointHistoryEntity)
    private readonly pointHistoryRepository: Repository<PointHistoryEntity>,
  ) {}

  async changePoint(
    userId: number,
    changePoint: number,
    history: string,
    transactionManager: EntityManager,
  ): Promise<number> {
    const user = await transactionManager.findOne(UserEntity, {
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Wrong userId!');
    }
    const originPoint = user.point;
    if (originPoint + changePoint < 0) {
      throw new BadRequestException("Don't have enough point!");
    }

    user.point = originPoint + changePoint;
    await transactionManager.save(user);

    const newHistory = transactionManager.create(PointHistoryEntity, {
      userId: userId,
      history: history,
      changePoint: changePoint,
      resultPoint: user.point,
    });
    await transactionManager.save(newHistory);
    return user.point;
  }

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

    let userCharacter: CharacterEntity | undefined;

    const { requiredPoints, itemCategory, ...itemMetadata } = requestDto;
    const responseDto = new PurchaseItemResponseDto();
    let historyDescription: string = '';

    // itemCategory에 따라 character entity 조회
    if (
      itemCategory === ItemCategory.CHARACTER_EVOLUTION ||
      itemCategory === ItemCategory.CHARACTER_TYPE_CHANGE
    ) {
      userCharacter = await transactionManager.findOne(CharacterEntity, {
        where: { userId: userId },
      });

      if (!userCharacter) {
        throw new NotFoundException('캐릭터 정보를 찾을 수 없습니다.');
      }
    }

    switch (itemCategory) {
      case ItemCategory.COURSE_REVIEW_READING_TICKET:
        const days = itemMetadata.days;

        if (!days) {
          throw new BadRequestException('열람권 일수 정보가 없습니다.');
        }

        if (!this.checkRequiredPoints(requiredPoints, itemCategory, days)) {
          throw new BadRequestException(
            '요구 포인트가 아이템 정보와 일치하지 않습니다',
          );
        }

        responseDto.viewableUntil = await this.userSerivce.updateViewableUntil(
          transactionManager,
          user,
          days,
        );
        historyDescription = `Reading course reviews - ${days} days`;
        break;

      case ItemCategory.CHARACTER_EVOLUTION:
        if (
          !this.checkRequiredPoints(
            requiredPoints,
            itemCategory,
            userCharacter.level + 1,
          )
        ) {
          throw new BadRequestException(
            '요구 포인트가 아이템 정보와 일치하지 않습니다',
          );
        }

        const newLevel = await this.userSerivce.upgradeUserCharacter(
          transactionManager,
          userCharacter,
        );
        responseDto.upgradeLevel = newLevel;
        historyDescription = `Evolving characters level ${newLevel}`;
        break;

      case ItemCategory.CHARACTER_TYPE_CHANGE:
        if (!this.checkRequiredPoints(requiredPoints, itemCategory)) {
          throw new BadRequestException(
            '요구 포인트가 아이템 정보와 일치하지 않습니다',
          );
        }

        responseDto.newCharacterType =
          await this.userSerivce.changeUserCharacterType(
            transactionManager,
            userCharacter,
          );
        historyDescription = `Changing character types`;
        break;
    }

    await this.changePoint(
      userId,
      -1 * requiredPoints,
      historyDescription,
      transactionManager,
    );

    return responseDto;
  }

  async getPointHistory(
    user: AuthorizedUserDto,
  ): Promise<GetPointHistoryResponseDto[]> {
    const histories = await this.pointHistoryRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    return histories.map((history) => new GetPointHistoryResponseDto(history));
  }

  // 넘겨받은 requiredPoints와 서버 내부에 매핑되어있는 상품-포인트 정보가 일치하는지 확인하는 함수
  // 프론트 측에 표시되는 requiredPoints가 올바른지 확인
  private checkRequiredPoints(
    requiredPoints: number,
    category: ItemCategory,
    metadata?: number,
  ): boolean {
    if (
      category === ItemCategory.COURSE_REVIEW_READING_TICKET ||
      category === ItemCategory.CHARACTER_EVOLUTION
    ) {
      return requiredPoints === RequiredPoints[category][metadata];
    } else {
      return requiredPoints === RequiredPoints[category];
    }
  }
}
