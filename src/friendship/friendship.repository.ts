import { Injectable } from '@nestjs/common';
import { FriendshipEntity } from 'src/entities/friendship.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateFriendshipDto } from './dto/create-friendship.dto';

@Injectable()
export class FriendshipRepository extends Repository<FriendshipEntity> {
  constructor(dataSource: DataSource) {
    super(FriendshipEntity, dataSource.createEntityManager());
  }

  async createFriendship(
    createFriendshipDto: CreateFriendshipDto,
  ): Promise<FriendshipEntity> {
    const { fromUserId, toUserId } = createFriendshipDto;
    const friendship = this.create({
      fromUser: { id: fromUserId },
      toUser: { id: toUserId },
      areWeFriend: false,
    });
    return await this.save(friendship);
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

  async findReceivedFriendshipsByUserId(
    userId: number,
  ): Promise<FriendshipEntity[]> {
    return await this.find({
      where: [{ toUser: { id: userId }, areWeFriend: false }],
      relations: ['fromUser', 'toUser'],
    });
  }
}
