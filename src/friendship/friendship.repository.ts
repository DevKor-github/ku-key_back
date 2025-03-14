import { Injectable } from '@nestjs/common';
import { FriendshipEntity } from 'src/entities/friendship.entity';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class FriendshipRepository extends Repository<FriendshipEntity> {
  constructor(dataSource: DataSource) {
    super(FriendshipEntity, dataSource.createEntityManager());
  }

  async findFriendshipByFriendshipId(
    friendshipId: number,
  ): Promise<FriendshipEntity> {
    return await this.findOne({
      where: { id: friendshipId },
      relations: ['fromUser', 'toUser'],
    });
  }

  async findFriendshipBetweenUsers(
    fromUserId: number,
    toUserId: number,
  ): Promise<FriendshipEntity> {
    return await this.findOne({
      where: [
        { fromUserId: fromUserId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
  }

  async findFriendshipsByUserId(userId: number): Promise<FriendshipEntity[]> {
    return await this.find({
      where: [
        { fromUserId: userId, areWeFriend: true },
        { toUserId: userId, areWeFriend: true },
      ],
      relations: [
        'fromUser',
        'toUser',
        'fromUser.character',
        'toUser.character',
      ],
    });
  }

  async findFriendshipsByUserIdAndKeyword(
    userId: number,
    keyword: string,
  ): Promise<FriendshipEntity[]> {
    return await this.createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.fromUser', 'fromUser')
      .leftJoinAndSelect('fromUser.character', 'fromUserCharacter') // fromUser와 연관된 character 엔티티 가져오기
      .leftJoinAndSelect('friendship.toUser', 'toUser')
      .leftJoinAndSelect('toUser.character', 'toUserCharacter')
      .where('friendship.areWeFriend = :areWeFriend', { areWeFriend: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where('fromUser.id = :userId', { userId })
            .andWhere(
              new Brackets((qb2) => {
                qb2
                  .where('toUser.username LIKE :keyword', {
                    keyword: `%${keyword}%`,
                  })
                  .orWhere('toUser.name LIKE :keyword', {
                    keyword: `%${keyword}%`,
                  });
              }),
            )
            .orWhere('toUser.id = :userId', { userId })
            .andWhere(
              new Brackets((qb2) => {
                qb2
                  .where('fromUser.username LIKE :keyword', {
                    keyword: `%${keyword}%`,
                  })
                  .orWhere('fromUser.name LIKE :keyword', {
                    keyword: `%${keyword}%`,
                  });
              }),
            );
        }),
      )
      .getMany();
  }

  async findSentFriendshipsByUserId(
    userId: number,
  ): Promise<FriendshipEntity[]> {
    return await this.find({
      where: [{ fromUserId: userId, areWeFriend: false }],
      relations: [
        'fromUser',
        'toUser',
        'fromUser.character',
        'toUser.character',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async countReceivedFriendships(
    userId: number,
  ): Promise<{ totalCount: number; unreadCount: number }> {
    const result = await this.createQueryBuilder('friendship')
      .select([
        'COUNT(*) AS totalCount',
        'COALESCE(SUM(CASE WHEN friendship.isRead = false THEN 1 ELSE 0 END), 0) AS unreadCount',
      ])
      .where('friendship.toUserId = :userId', { userId })
      .andWhere('friendship.areWeFriend = false')
      .getRawOne();

    return {
      totalCount: parseInt(result.totalCount, 10),
      unreadCount: parseInt(result.unreadCount, 10),
    };
  }
}
