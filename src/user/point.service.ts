import { EntityManager, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CharacterEvolutionMetadata,
  CourseReviewMetadata,
  PurchaseItemRequestDto,
} from './dto/purchase-item-request.dto';
import { UserService } from './user.service';
import { UserEntity } from 'src/entities/user.entity';
import { ItemCategory } from 'src/enums/item-category.enum';
import { PurchaseItemResponseDto } from './dto/purchase-item-response-dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { GetPointHistoryResponseDto } from './dto/get-point-history.dto';
import { PointHistoryEntity } from 'src/entities/point-history.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
}
