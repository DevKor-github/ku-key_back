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
import { UpdateFriendshipResponseDto } from './dto/update-friendship-response.dto';
import { DeleteFriendshipResponseDto } from './dto/delete-friendship-response.dto';
import { SearchUserResponseDto, Status } from './dto/search-user-response.dto';
import { FriendshipEntity } from 'src/entities/friendship.entity';
import { UserService } from 'src/user/user.service';
import { TimetableService } from 'src/timetable/timetable.service';
import { GetFriendTimetableRequestDto } from './dto/get-friend-timetable.dto';
import { GetTimetableByTimetableIdDto } from 'src/timetable/dto/get-timetable-timetable.dto';
import { SearchUserQueryDto } from './dto/search-user-query.dto';
import { GetWaitingFriendResponseDto } from './dto/get-waiting-friend-response.dto';
import { EntityManager } from 'typeorm';
import { NoticeService } from 'src/notice/notice.service';
import { Notice } from 'src/notice/enum/notice.enum';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(FriendshipRepository)
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userService: UserService,
    private readonly timetableService: TimetableService,
    private readonly noticeService: NoticeService,
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
      return new GetFriendResponseDto(friendship.id, friend);
    });

    return friendList;
  }

  async searchUserForFriendshipRequest(
    myId: number,
    searchUserQueryDto: SearchUserQueryDto,
  ): Promise<SearchUserResponseDto> {
    const username = searchUserQueryDto.username;
    let userStatus: Status;

    const user = await this.userService.findUserByUsername(username);

    if (!user || !user.isVerified) {
      throw new BadRequestException('올바르지 않은 상대입니다.');
    }

    if (myId == user.id) {
      // 본인을 검색한 경우 status
      userStatus = Status.Me;
    } else {
      const checkFriendship =
        await this.friendshipRepository.findFriendshipBetweenUsers(
          myId,
          user.id,
        );

      // 수락 대기 중 / 수락 보류 중 / 이미 친구 / 아직 친구 신청 x로 status 분리
      if (checkFriendship) {
        if (!checkFriendship.areWeFriend) {
          userStatus =
            checkFriendship.fromUserId == myId
              ? Status.Requested
              : Status.Pending;
        } else {
          userStatus = Status.Friend;
        }
      } else {
        userStatus = Status.Unknown;
      }
    }

    return new SearchUserResponseDto(userStatus, user);
  }

  async sendFriendshipRequest(
    transactionManager: EntityManager,
    fromUser: AuthorizedUserDto,
    toUsername: string,
  ): Promise<SendFriendshipResponseDto> {
    const fromUserId = fromUser.id;
    const fromUsername = fromUser.username;

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

    const checkFriendship = await transactionManager.findOne(FriendshipEntity, {
      where: [
        { fromUser: { id: fromUserId }, toUser: { id: toUserId } },
        { fromUser: { id: toUserId }, toUser: { id: fromUserId } },
      ],
    });

    if (checkFriendship) {
      if (!checkFriendship.areWeFriend) {
        throw new BadRequestException('이미 친구 요청을 보냈거나 받았습니다.');
      } else {
        throw new BadRequestException('이미 친구인 유저입니다.');
      }
    }

    const friendship = transactionManager.create(FriendshipEntity, {
      fromUser: { id: fromUserId },
      toUser: { id: toUserId },
      areWeFriend: false,
    });

    const savedFriendship = await transactionManager.save(
      FriendshipEntity,
      friendship,
    );

    if (!savedFriendship) {
      throw new BadRequestException('친구 요청 보내기에 실패했습니다.');
    } else {
      await this.noticeService.emitNotice(
        toUserId,
        `${fromUsername} sent you a friend request!`,
        Notice.friendRequest,
      );
      return new SendFriendshipResponseDto(true);
    }
  }

  async getReceivedWaitingFriendList(
    userId: number,
  ): Promise<GetWaitingFriendResponseDto[]> {
    const friendshipRequests =
      await this.friendshipRepository.findReceivedFriendshipsByUserId(userId);

    if (friendshipRequests.length === 0) {
      return [];
    }

    const waitingFriendList = friendshipRequests.map((friendshipRequest) => {
      const waitingFriend = friendshipRequest.fromUser;
      return new GetWaitingFriendResponseDto(
        friendshipRequest.id,
        waitingFriend,
      );
    });

    return waitingFriendList;
  }

  async getSentWaitingFriendList(
    userId: number,
  ): Promise<GetWaitingFriendResponseDto[]> {
    const friendshipRequests =
      await this.friendshipRepository.findSentFriendshipsByUserId(userId);

    if (friendshipRequests.length === 0) {
      return [];
    }

    const waitingFriendList = friendshipRequests.map((friendshipRequest) => {
      const waitingFriend = friendshipRequest.toUser;
      return new GetWaitingFriendResponseDto(
        friendshipRequest.id,
        waitingFriend,
      );
    });

    return waitingFriendList;
  }

  async acceptFriendshipRequest(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    friendshipId: number,
  ): Promise<UpdateFriendshipResponseDto> {
    const userId = user.id;
    const username = user.username;

    const friendship = await transactionManager.findOne(FriendshipEntity, {
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new BadRequestException('받은 친구 요청을 찾을 수 없습니다.');
    }

    if (friendship.toUserId !== userId) {
      throw new BadRequestException(
        '나에게 온 친구 요청만 수락할 수 있습니다.',
      );
    }

    if (friendship.areWeFriend) {
      throw new BadRequestException('이미 수락한 요청입니다.');
    }
    const updatedResult = await transactionManager.update(
      FriendshipEntity,
      { id: friendshipId },
      { areWeFriend: true },
    );

    if (updatedResult.affected === 0) {
      throw new InternalServerErrorException('친구 요청 수락에 실패했습니다.');
    } else {
      await this.noticeService.emitNotice(
        friendship.fromUserId,
        `${username} has just accepted your friend request!`,
        Notice.friendAccept,
      );
      return new UpdateFriendshipResponseDto(true);
    }
  }

  async rejectFriendshipRequest(
    transactionManager: EntityManager,
    userId: number,
    friendshipId: number,
  ): Promise<DeleteFriendshipResponseDto> {
    const friendship = await transactionManager.findOne(FriendshipEntity, {
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('받은 친구 요청을 찾을 수 없습니다.');
    }

    if (friendship.toUserId !== userId) {
      throw new BadRequestException(
        '나에게 온 친구 요청만 거절할 수 있습니다.',
      );
    }

    if (friendship.areWeFriend) {
      throw new BadRequestException(
        '아직 수락하지 않은 친구 요청에 대해서만 거절할 수 있습니다.',
      );
    }
    const deleteResult = await transactionManager.softDelete(
      FriendshipEntity,
      friendshipId,
    );
    if (deleteResult.affected === 0) {
      throw new InternalServerErrorException('친구 요청 거절에 실패했습니다.');
    } else {
      return new DeleteFriendshipResponseDto(true);
    }
  }

  async cancelFriendshipRequest(
    transactionManager: EntityManager,
    userId: number,
    friendshipId: number,
  ): Promise<DeleteFriendshipResponseDto> {
    const friendship = await transactionManager.findOne(FriendshipEntity, {
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('보낸 친구 요청을 찾을 수 없습니다.');
    }

    if (friendship.fromUserId !== userId) {
      throw new BadRequestException(
        '내가 보낸 친구 요청만 취소할 수 있습니다.',
      );
    }

    if (friendship.areWeFriend) {
      throw new BadRequestException(
        '아직 수락되지 않은 친구 요청에 대해서만 취소할 수 있습니다.',
      );
    }
    const deleteResult = await transactionManager.softDelete(
      FriendshipEntity,
      friendshipId,
    );
    if (deleteResult.affected === 0) {
      throw new InternalServerErrorException('친구 요청 거절에 실패했습니다.');
    } else {
      return new DeleteFriendshipResponseDto(true);
    }
  }

  async deleteFriendship(
    transactionMangager: EntityManager,
    userId: number,
    friendshipId: number,
  ): Promise<DeleteFriendshipResponseDto> {
    const friendship = await transactionMangager.findOne(FriendshipEntity, {
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('친구 정보를 찾을 수 없습니다.');
    }

    if (friendship.toUserId !== userId && friendship.fromUserId !== userId) {
      throw new BadRequestException('내 친구 목록에서만 삭제할 수 있습니다.');
    }

    if (!friendship.areWeFriend) {
      throw new BadRequestException('이미 친구인 경우에만 삭제할 수 있습니다.');
    }
    const deleteResult = await transactionMangager.softDelete(
      FriendshipEntity,
      friendshipId,
    );
    if (deleteResult.affected === 0) {
      throw new InternalServerErrorException('친구 요청 거절에 실패했습니다.');
    } else {
      return new DeleteFriendshipResponseDto(true);
    }
  }

  async getFriendTimetable(
    userId: number,
    getFriendTimetableRequestDto: GetFriendTimetableRequestDto,
  ): Promise<GetTimetableByTimetableIdDto> {
    // username으로 친구정보 가져오기
    const friend = await this.userService.findUserByUsername(
      getFriendTimetableRequestDto.username,
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

    const friendTimetable = await this.timetableService.getFriendTimetable(
      friend.id,
      getFriendTimetableRequestDto.semester,
      getFriendTimetableRequestDto.year,
    );

    if (!friendTimetable) {
      throw new NotFoundException('친구의 시간표를 찾을 수 없습니다.');
    }
    return friendTimetable;
  }
}
