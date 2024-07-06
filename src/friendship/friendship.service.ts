import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipRepository } from './friendship.repository';
import { SendFriendshipResponseDto } from './dto/send-friendship-response.dto';
import { GetFriendResponseDto } from './dto/get-friend-response.dto';
import { GetWaitingFriendResponseDto } from './dto/get-waiting-friend-response.dto';
import { UpdateFriendshipResponseDto } from './dto/update-friendship-response.dto';
import { DeleteFriendshipResponseDto } from './dto/delete-friendship-response.dto';
import { RejectFriendshipResponseDto } from './dto/reject-friendship-response.dto';
import { SearchUserResponseDto } from './dto/search-user-response.dto';
import { FriendshipEntity } from 'src/entities/friendship.entity';
import { UserService } from 'src/user/user.service';
import { TimeTableService } from 'src/timetable/timetable.service';
import { GetFriendTimeTableRequestDto } from './dto/get-friend-timetable.dto';
import { GetTimeTableByTimeTableIdDto } from 'src/timetable/dto/get-timetable-timetable.dto';
import { SearchUserQueryDto } from './dto/search-user-query.dto';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(FriendshipRepository)
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userService: UserService,
    private readonly timeTableService: TimeTableService,
  ) {}

  async getFriendList(
    userId: number,
    keyword?: string,
  ): Promise<GetFriendResponseDto[]> {
    let friendships: FriendshipEntity[];

    if (keyword) {
      friendships =
        await this.friendshipRepository.findFriendshipByUserIdAndKeyword(
          userId,
          keyword,
        );
    } else {
      friendships =
        await this.friendshipRepository.findFriendshipsByUserId(userId);
    }

    if (!friendships) {
      throw new NotFoundException('친구 목록을 불러오는데 실패했습니다.');
    }

    // 현재 친구가 없는 경우
    if (friendships.length === 0) {
      return [];
    }

    const friendList = friendships.map((friendship) => {
      const friend =
        friendship.fromUser.id === userId
          ? friendship.toUser
          : friendship.fromUser;
      return {
        friendshipId: friendship.id,
        userId: friend.id,
        name: friend.name,
        username: friend.username,
        major: friend.major,
        language: friend.language,
      };
    });

    return friendList;
  }

  async searchUserForFriendshipRequest(
    myId: number,
    searchUserQueryDto: SearchUserQueryDto,
  ): Promise<SearchUserResponseDto> {
    const username = searchUserQueryDto.username;
    const userInfo = new SearchUserResponseDto();

    const user = await this.userService.findUserByUsername(username);

    if (!user || !user.isVerified) {
      throw new BadRequestException('올바르지 않은 상대입니다.');
    }

    if (myId == user.id) {
      // 본인을 검색한 경우 status
      userInfo.status = 'me';
    } else {
      const checkFriendship =
        await this.friendshipRepository.findFriendshipBetweenUsers(
          myId,
          user.id,
        );

      // 수락 대기 중 / 수락 보류 중 / 이미 친구 / 아직 친구 신청 x로 status 분리
      if (checkFriendship) {
        if (!checkFriendship.areWeFriend) {
          userInfo.status =
            checkFriendship.fromUser.id == myId ? 'requested' : 'pending';
        } else {
          userInfo.status = 'friend';
        }
      } else {
        userInfo.status = 'unknown';
      }
    }

    userInfo.name = user.name;
    userInfo.username = user.username;
    userInfo.major = user.major;
    userInfo.language = user.language;

    return userInfo;
  }

  async sendFriendshipRequest(
    fromUserId: number,
    toUsername: string,
  ): Promise<SendFriendshipResponseDto> {
    const toUser = await this.userService.findUserByUsername(toUsername);

    if (!toUser) {
      throw new BadRequestException('해당 유저를 찾을 수 없습니다.');
    }

    const toUserId = toUser.id;

    if (fromUserId === toUserId) {
      throw new BadRequestException(
        '자기 자신에게는 친구 요청을 보낼 수 없습니다.',
      );
    }

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
      const friendship = await this.friendshipRepository.createFriendship(
        fromUserId,
        toUserId,
      );

      if (!friendship) {
        throw new BadRequestException('친구 요청 보내기에 실패했습니다.');
      } else {
        return new SendFriendshipResponseDto(true);
      }
    }
  }

  async getWaitingFriendList(
    userId: number,
  ): Promise<GetWaitingFriendResponseDto[]> {
    const friendshipRequests =
      await this.friendshipRepository.findReceivedFriendshipsByUserId(userId);

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
    userId: number,
    friendshipId: number,
  ): Promise<UpdateFriendshipResponseDto> {
    const friendship =
      await this.friendshipRepository.findFriendshipByFriendshipId(
        friendshipId,
      );

    if (friendship.toUser.id !== userId) {
      throw new BadRequestException(
        '나에게 온 친구 요청만 수락할 수 있습니다.',
      );
    }

    if (friendship.areWeFriend) {
      throw new BadRequestException('이미 수락한 요청입니다.');
    }

    const isUpdated = await this.friendshipRepository.updateFriendship(
      friendshipId,
      true,
    );

    if (!isUpdated) {
      throw new InternalServerErrorException('친구 요청 수락에 실패했습니다.');
    } else {
      return new UpdateFriendshipResponseDto(true);
    }
  }

  async rejectFriendshipRequest(
    userId: number,
    friendshipId: number,
  ): Promise<RejectFriendshipResponseDto> {
    const friendship =
      await this.friendshipRepository.findFriendshipByFriendshipId(
        friendshipId,
      );

    if (!friendship) {
      throw new NotFoundException('받은 친구 요청을 찾을 수 없습니다.');
    }

    if (friendship.toUser.id !== userId) {
      throw new BadRequestException(
        '나에게 온 친구 요청만 거절할 수 있습니다.',
      );
    }

    if (friendship.areWeFriend) {
      throw new BadRequestException(
        '아직 수락하지 않은 친구 요청에 대해서만 거절할 수 있습니다.',
      );
    }
    const isDeleted =
      await this.friendshipRepository.deleteFriendship(friendshipId);
    if (!isDeleted) {
      throw new InternalServerErrorException('친구 요청 거절에 실패했습니다.');
    } else {
      return new RejectFriendshipResponseDto(true);
    }
  }

  async deleteFriendship(
    userId: number,
    friendshipId: number,
  ): Promise<DeleteFriendshipResponseDto> {
    const friendship =
      await this.friendshipRepository.findFriendshipByFriendshipId(
        friendshipId,
      );

    if (!friendship) {
      throw new NotFoundException('친구 정보를 찾을 수 없습니다.');
    }

    if (friendship.toUser.id !== userId && friendship.fromUser.id !== userId) {
      throw new BadRequestException('내 친구 목록에서만 삭제할 수 있습니다.');
    }

    if (!friendship.areWeFriend) {
      throw new BadRequestException('이미 친구인 경우에만 삭제할 수 있습니다.');
    }

    const isDeleted =
      await this.friendshipRepository.deleteFriendship(friendshipId);
    if (!isDeleted) {
      throw new InternalServerErrorException('친구 삭제에 실패했습니다.');
    } else {
      return new DeleteFriendshipResponseDto(true);
    }
  }

  async getFriendTimeTable(
    userId: number,
    getFriendTimeTableRequestDto: GetFriendTimeTableRequestDto,
  ): Promise<GetTimeTableByTimeTableIdDto> {
    // username으로 친구정보 가져오기
    const friend = await this.userService.findUserByUsername(
      getFriendTimeTableRequestDto.username,
    );

    if (!friend) {
      throw new NotFoundException('친구 정보를 찾을 수 없습니다.');
    }
    // 친구인지 아닌지 체크
    const checkFriendship =
      await this.friendshipRepository.findFriendshipBetweenUsers(
        userId,
        friend.id,
      );

    if (!checkFriendship || !checkFriendship.areWeFriend) {
      throw new NotFoundException('친구 정보를 찾을 수 없습니다.');
    }

    const friendTimeTable = await this.timeTableService.getFriendTimeTable(
      friend.id,
      getFriendTimeTableRequestDto.semester,
      getFriendTimeTableRequestDto.year,
    );

    if (!friendTimeTable) {
      throw new NotFoundException('친구의 시간표를 찾을 수 없습니다.');
    }
    return friendTimeTable;
  }
}
