import { Injectable } from '@nestjs/common';
import { FriendshipEntity } from 'src/entities/friendship.entity';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class FriendshipRepository extends Repository<FriendshipEntity> {
  constructor(dataSource: DataSource) {
    super(FriendshipEntity, dataSource.createEntityManager());
  }

  async createFriendship(
    fromUserId: number,
    toUserId: number,
  ): Promise<FriendshipEntity> {
    const friendship = this.create({
      fromUser: { id: fromUserId },
      toUser: { id: toUserId },
      areWeFriend: false,
    });
    return await this.save(friendship);
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
        { fromUser: { id: fromUserId }, toUser: { id: toUserId } },
        { fromUser: { id: toUserId }, toUser: { id: fromUserId } },
      ],
    });
  }

  async findFriendshipsByUserId(userId: number): Promise<FriendshipEntity[]> {
    return await this.find({
      where: [
        { fromUser: { id: userId }, areWeFriend: true },
        { toUser: { id: userId }, areWeFriend: true },
      ],
      relations: ['fromUser', 'toUser'],
    });
  }

  async findFriendshipByUserIdAndKeyword(
    userId: number,
    keyword: string,
  ): Promise<FriendshipEntity[]> {
    return await this.createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.fromUser', 'fromUser')
      .leftJoinAndSelect('friendship.toUser', 'toUser')
      .where('friendship.areWeFriend = :areWeFriend', { areWeFriend: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where('fromUser.id = :userId', { userId }).orWhere(
            'toUser.id = :userId',
            { userId },
          );
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('fromUser.username LIKE :keyword', {
            keyword: `%${keyword}%`,
          })
            .orWhere('fromUser.name LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('toUser.username LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('toUser.name LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      )
      .getMany();
  }

  async findReceivedFriendshipsByUserId(
    userId: number,
  ): Promise<FriendshipEntity[]> {
    return await this.find({
      where: [{ toUser: { id: userId }, areWeFriend: false }],
      relations: ['fromUser', 'toUser'],
    });
  }

  async updateFriendship(
    friendshipId: number,
    areWeFriend: boolean,
  ): Promise<boolean> {
    const updateResult = await this.update(
      { id: friendshipId },
      { areWeFriend: areWeFriend },
    );

    return updateResult.affected ? true : false;
  }

  async deleteFriendship(friendshipId: number): Promise<boolean> {
    const deleteResult = await this.softDelete(friendshipId);

    return deleteResult.affected ? true : false;
  }
}
