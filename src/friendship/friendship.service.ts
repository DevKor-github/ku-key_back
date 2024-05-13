import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipRepository } from './friendship.repository';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { SendFriendshipResponseDto } from './dto/send-friendship-response.dto';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(FriendshipRepository)
    private readonly friendshipRepository: FriendshipRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async sendFriendshipRequest(
    createFriendDto: CreateFriendshipDto,
  ): Promise<SendFriendshipResponseDto> {
    const { fromUserId, toUsername } = createFriendDto;
    const toUser = await this.userRepository.findUserByUsername(toUsername);

    if (!toUser) {
      throw new BadRequestException('해당 유저를 찾을 수 없습니다.');
    }

    const checkFriendship =
      await this.friendshipRepository.findFriendshipBetweenUsers(
        fromUserId,
        Number(toUser.id),
      );

    if (checkFriendship) {
      if (!checkFriendship.areWeFriend) {
        throw new BadRequestException('이미 친구 요청을 보냈습니다.');
      } else {
        throw new BadRequestException('이미 친구인 유저입니다.');
      }
    } else {
      const friendship = await this.friendshipRepository.createFriendship({
        fromUserId: fromUserId,
        toUsername: toUsername,
      });

      if (!friendship) {
        return new SendFriendshipResponseDto(false);
      } else {
        return new SendFriendshipResponseDto(true);
      }
    }
  }
}
