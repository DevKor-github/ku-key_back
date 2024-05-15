import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipRepository } from './friendship.repository';
import { SendFriendshipResponseDto } from './dto/send-friendship-response.dto';
import { UserRepository } from 'src/user/user.repository';
import { getFriendResponseDto } from './dto/get-friend-response.dto';
import { getWaitingFriendResponseDto } from './dto/get-waiting-friend-response.dto';
import { UpdateFriendshipResponseDto } from './dto/update-friendship-response.dto';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(FriendshipRepository)
    private readonly friendshipRepository: FriendshipRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async getFriendList(id: number): Promise<getFriendResponseDto[]> {
    const friendships =
      await this.friendshipRepository.findFriendshipsByUserId(id);

    // 현재 친구가 없는 경우
    if (friendships.length === 0) {
      return [];
    }

    const friendList = friendships.map((friendship) => {
      const friend =
        friendship.fromUser.id === id ? friendship.toUser : friendship.fromUser;
      return {
        userId: friend.id,
        name: friend.name,
        username: friend.username,
        major: friend.major,
        language: friend.language,
      };
    });

    return friendList;
  }

  async sendFriendshipRequest(
    fromUserId: number,
    toUsername: string,
  ): Promise<SendFriendshipResponseDto> {
    const toUser = await this.userRepository.findUserByUsername(toUsername);

    if (!toUser) {
      throw new BadRequestException('해당 유저를 찾을 수 없습니다.');
    }

    const toUserId = toUser.id;

    const checkFriendship =
      await this.friendshipRepository.findFriendshipBetweenUsers(
        fromUserId,
        toUserId,
      );

    if (checkFriendship) {
      if (!checkFriendship.areWeFriend) {
        throw new BadRequestException('이미 친구 요청을 보냈거나 받았습니다.');
      } else {
        throw new BadRequestException('이미 친구인 유저입니다.');
      }
    } else {
      const friendship = await this.friendshipRepository.createFriendship({
        fromUserId: fromUserId,
        toUserId: toUserId,
      });

      if (!friendship) {
        return new SendFriendshipResponseDto(false);
      } else {
        return new SendFriendshipResponseDto(true);
      }
    }
  }

  async getWaitingFriendList(
    id: number,
  ): Promise<getWaitingFriendResponseDto[]> {
    const friendshipRequests =
      await this.friendshipRepository.findReceivedFriendshipsByUserId(id);

    if (friendshipRequests.length === 0) {
      return [];
    }

    const waitingFriendList = friendshipRequests.map((friendshipRequest) => {
      const waitingFriend = friendshipRequest.fromUser;
      return {
        friendshipId: friendshipRequest.id,
        userId: waitingFriend.id,
        name: waitingFriend.name,
        username: waitingFriend.username,
        major: waitingFriend.major,
        language: waitingFriend.language,
      };
    });

    return waitingFriendList;
  }

  async acceptFriendshipRequest(
    friendshipId: number,
  ): Promise<UpdateFriendshipResponseDto> {
    const isUpdated = await this.friendshipRepository.updateFriendship(
      friendshipId,
      true,
    );

    if (!isUpdated) {
      throw new NotImplementedException('친구 요청 수락에 실패했습니다.');
    } else {
      return new UpdateFriendshipResponseDto(true);
    }
  }
}
