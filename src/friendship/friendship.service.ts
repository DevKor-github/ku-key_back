import { GetReceivedFriendshipRequestCountDto } from './dto/get-received-friendship-request-count.dto';
import { Injectable } from '@nestjs/common';
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
import { GetWaitingFriendResponseDto } from './dto/get-waiting-friend-response.dto';
import { EntityManager } from 'typeorm';
import { NoticeService } from 'src/notice/notice.service';
import { Notice } from 'src/notice/enum/notice.enum';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SearchUserRequestDto } from './dto/search-user-query.dto';
import { throwKukeyException } from 'src/utils/exception.util';

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
        await this.friendshipRepository.findFriendshipsByUserIdAndKeyword(
          userId,
          keyword,
        );
    } else {
      friendships =
        await this.friendshipRepository.findFriendshipsByUserId(userId);
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
    searchUserRequestDto: SearchUserRequestDto,
  ): Promise<SearchUserResponseDto> {
    const username = searchUserRequestDto.username;
    let userStatus: Status;

    const user = await this.userService.findUserByUsername(username);

    if (!user || !user.isVerified) {
      return null;
    }

    const character = await this.userService.findCharacterByUserId(user.id);
    if (!character) {
      throwKukeyException('CHARACTER_NOT_FOUND');
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

    return new SearchUserResponseDto(userStatus, user, character);
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
      throwKukeyException('USER_NOT_FOUND');
    }

    const toUserId = toUser.id;

    if (fromUserId === toUserId) {
      throwKukeyException('FRIENDSHIP_REQUEST_TO_SELF');
    }

    const checkFriendship = await transactionManager.findOne(FriendshipEntity, {
      where: [
        { fromUser: { id: fromUserId }, toUser: { id: toUserId } },
        { fromUser: { id: toUserId }, toUser: { id: fromUserId } },
      ],
    });

    if (checkFriendship) {
      throwKukeyException('FRIENDSHIP_ALREADY_EXIST');
    }

    const friendship = transactionManager.create(FriendshipEntity, {
      fromUser: { id: fromUserId },
      toUser: { id: toUserId },
      areWeFriend: false,
    });

    await transactionManager.save(FriendshipEntity, friendship);

    await this.noticeService.emitNotice(
      toUserId,
      `${fromUsername} sent you a friend request!`,
      Notice.friendRequest,
    );
    return new SendFriendshipResponseDto(true);
  }

  async getReceivedWaitingFriendList(
    transactionManager: EntityManager,
    userId: number,
  ): Promise<GetWaitingFriendResponseDto[]> {
    const receivedFriendshipRequests = await transactionManager.find(
      FriendshipEntity,
      {
        where: { toUserId: userId, areWeFriend: false },
        relations: ['fromUser', 'fromUser.character'],
      },
    );

    if (receivedFriendshipRequests.length === 0) {
      return [];
    }

    await transactionManager.update(
      FriendshipEntity,
      { toUserId: userId, areWeFriend: false, isRead: false },
      { isRead: true },
    );

    return receivedFriendshipRequests.map((r) => {
      return new GetWaitingFriendResponseDto(r.id, r.fromUser);
    });
  }

  async getReceivedFriendshipRequestCount(
    userId: number,
  ): Promise<GetReceivedFriendshipRequestCountDto> {
    const { totalCount, unreadCount } =
      await this.friendshipRepository.countReceivedFriendships(userId);

    const recentRequests = await this.friendshipRepository.find({
      where: { toUserId: userId, areWeFriend: false },
      relations: ['fromUser', 'fromUser.character'],
      order: { createdAt: 'DESC' },
      select: ['fromUser'],
      take: 2,
    });

    const recentCharacters = recentRequests.map((req) => {
      return req.fromUser.character;
    });

    return new GetReceivedFriendshipRequestCountDto(
      totalCount,
      unreadCount,
      recentCharacters,
    );
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
      throwKukeyException('FRIENDSHIP_NOT_FOUND');
    }

    if (friendship.toUserId !== userId) {
      throwKukeyException('FRIENDSHIP_ACCESS_FORBIDDEN');
    }

    if (friendship.areWeFriend) {
      throwKukeyException('FRIENDSHIP_REQUEST_ALREADY_ACCEPTED');
    }
    const updatedResult = await transactionManager.update(
      FriendshipEntity,
      { id: friendshipId },
      { areWeFriend: true },
    );

    if (updatedResult.affected === 0) {
      throwKukeyException('FRIENDSHIP_REQUEST_ACCEPT_FAILED');
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
      throwKukeyException('FRIENDSHIP_NOT_FOUND');
    }

    if (friendship.toUserId !== userId) {
      throwKukeyException('FRIENDSHIP_ACCESS_FORBIDDEN');
    }

    if (friendship.areWeFriend) {
      throwKukeyException('FRIENDSHIP_REQUEST_ALREADY_ACCEPTED');
    }
    const deleteResult = await transactionManager.softDelete(
      FriendshipEntity,
      friendshipId,
    );
    if (deleteResult.affected === 0) {
      throwKukeyException('FRIENDSHIP_REQUEST_REJECT_FAILED');
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
      throwKukeyException('FRIENDSHIP_NOT_FOUND');
    }

    if (friendship.fromUserId !== userId) {
      throwKukeyException('FRIENDSHIP_ACCESS_FORBIDDEN');
    }

    if (friendship.areWeFriend) {
      throwKukeyException('FRIENDSHIP_REQUEST_ALREADY_ACCEPTED');
    }
    const deleteResult = await transactionManager.softDelete(
      FriendshipEntity,
      friendshipId,
    );
    if (deleteResult.affected === 0) {
      throwKukeyException('FRIENDSHIP_REQUEST_CANCEL_FAILED');
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
      throwKukeyException('FRIENDSHIP_NOT_FOUND');
    }

    if (friendship.toUserId !== userId && friendship.fromUserId !== userId) {
      throwKukeyException('FRIENDSHIP_ACCESS_FORBIDDEN');
    }

    if (!friendship.areWeFriend) {
      throwKukeyException('FRIENDSHIP_REQUEST_NOT_ACCEPTED');
    }
    const deleteResult = await transactionMangager.softDelete(
      FriendshipEntity,
      friendshipId,
    );
    if (deleteResult.affected === 0) {
      throwKukeyException('FRIENDSHIP_DELETE_FAILED');
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
      throwKukeyException('USER_NOT_FOUND');
    }
    // 친구인지 아닌지 체크
    const checkFriendship =
      await this.friendshipRepository.findFriendshipBetweenUsers(
        userId,
        friend.id,
      );

    if (!checkFriendship) {
      throwKukeyException('FRIENDSHIP_NOT_FOUND');
    }

    if (!checkFriendship.areWeFriend) {
      throwKukeyException('FRIENDSHIP_REQUEST_NOT_ACCEPTED');
    }

    const friendTimetable = await this.timetableService.getFriendTimetable(
      friend.id,
      getFriendTimetableRequestDto.semester,
      getFriendTimetableRequestDto.year,
    );

    if (!friendTimetable) {
      throwKukeyException('FRIEND_TIMETABLE_NOT_FOUND');
    }
    return friendTimetable;
  }
}
