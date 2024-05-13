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
    const { fromUserId, toUsername } = createFriendshipDto;
    const friendship = this.create({
      fromUserId: { id: fromUserId },
      toUserId: { username: toUsername },
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
        { fromUserId: { id: fromUserId }, toUserId: { id: toUserId } },
        { fromUserId: { id: toUserId }, toUserId: { id: fromUserId } },
      ],
    });
  }
}
