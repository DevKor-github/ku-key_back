import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { DeleteFriendshipResponseDto } from 'src/friendship/dto/delete-friendship-response.dto';
import { GetFriendResponseDto } from 'src/friendship/dto/get-friend-response.dto';
import { GetWaitingFriendResponseDto } from 'src/friendship/dto/get-waiting-friend-response.dto';
import { SearchUserResponseDto } from 'src/friendship/dto/search-user-response.dto';
import { SendFriendshipRequestDto } from 'src/friendship/dto/send-friendship-request.dto';
import { SendFriendshipResponseDto } from 'src/friendship/dto/send-friendship-response.dto';
import { UpdateFriendshipResponseDto } from 'src/friendship/dto/update-friendship-response.dto';
import { FriendshipController } from 'src/friendship/friendship.controller';
import { GetTimetableByTimetableIdDto } from 'src/timetable/dto/get-timetable-timetable.dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';
import { GetReceivedFriendshipRequestCountDto } from 'src/friendship/dto/get-received-friendship-request-count.dto';

type FriendshipEndPoints = MethodNames<FriendshipController>;

const FriendshipDocsMap: Record<FriendshipEndPoints, MethodDecorator[]> = {
  getFriendList: [
    ApiOperation({
      summary: '친구 목록 조회',
      description:
        '전체 친구 목록을 조회하거나, keyword를 query로 받아 친구 목록을 필터링하여 조회합니다.',
    }),
    ApiQuery({ name: 'keyword', required: false, description: '검색 키워드' }),
    ApiOkResponse({
      description: '전체 혹은 필터링 된 친구 목록 반환',
      isArray: true,
      type: GetFriendResponseDto,
    }),
  ],
  searchUserForFriendshipRequest: [
    ApiOperation({
      summary: '친구 추가를 위한 유저 검색',
      description:
        'username(친구 추가용 id)를 query로 받아 해당하는 유저를 검색합니다. 검색 결과가 없는 경우 null을 반환합니다.',
    }),
    ApiQuery({
      name: 'username',
      description: '친구 추가용 id',
      required: true,
    }),
    ApiOkResponse({
      description:
        '검색된 유저 정보 반환, 유저가 존재하지 않거나 verify 되지 않은 경우 null 반환',
      type: SearchUserResponseDto,
    }),
    ApiKukeyExceptionResponse(['CHARACTER_NOT_FOUND']),
  ],
  getFriendTimetable: [
    ApiOperation({
      summary: '친구 시간표 조회',
      description:
        '친구 ID, 연도, 학기를 입력받아 해당 학기에 친구의 대표 시간표를 조회합니다.',
    }),
    ApiQuery({
      name: 'username',
      type: 'string',
      required: true,
      description: '친구 추가용 ID (username)',
    }),
    ApiQuery({
      name: 'year',
      type: 'string',
      required: true,
      description: '연도',
    }),
    ApiQuery({
      name: 'semester',
      type: 'string',
      required: true,
      description: '학기',
    }),
    ApiOkResponse({
      description: '친구 시간표 반환',
      type: GetTimetableByTimetableIdDto,
      isArray: true,
    }),
    ApiKukeyExceptionResponse([
      'USER_NOT_FOUND',
      'FRIENDSHIP_NOT_FOUND',
      'FRIENDSHIP_REQUEST_NOT_ACCEPTED',
    ]),
  ],
  sendFriendshipRequest: [
    ApiOperation({
      summary: '친구 요청 보내기',
      description:
        '검색된 유저에게 친구 요청을 보냅니다. friendship 레코드가 새로 생성됩니다.',
    }),
    ApiBody({
      type: SendFriendshipRequestDto,
    }),
    ApiCreatedResponse({
      description: '친구 요청 보내기 성공 시',
      type: SendFriendshipResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'USER_NOT_FOUND',
      'FRIENDSHIP_REQUEST_TO_SELF',
      'FRIENDSHIP_ALREADY_EXIST',
    ]),
  ],
  getReceivedWaitingFriendList: [
    ApiOperation({
      summary: '나에게 친구 요청을 보낸 유저 목록 조회',
      description: '나에게 친구 요청을 보낸 유저 목록을 조회합니다.',
    }),
    ApiOkResponse({
      description: '나에게 친구 요청을 보낸 유저 목록',
      isArray: true,
      type: GetWaitingFriendResponseDto,
    }),
  ],
  getReceivedFriendshipRequestCount: [
    ApiOperation({
      summary: '나에게 온 친구 요청 개수 조회',
      description:
        '나에게 온 친구 요청 전체 개수 / 아직 확인하지 않은 개수를 조회합니다.',
    }),
    ApiOkResponse({
      description: '나에게 온 친구 요청 전체 개수 / 아직 확인하지 않은 개수',
      type: GetReceivedFriendshipRequestCountDto,
    }),
  ],
  getSentWaitingFriendList: [
    ApiOperation({
      summary: '내가 친구 요청을 보낸 유저 목록 조회',
      description: '내가 친구 요청을 보낸 유저 목록을 조회합니다.',
    }),
    ApiOkResponse({
      description: '내가 친구 요청을 보낸 유저 목록',
      isArray: true,
      type: GetWaitingFriendResponseDto,
    }),
  ],
  acceptFriendshipRequest: [
    ApiOperation({
      summary: '받은 친구 요청 수락하기',
      description:
        'friendshipId를 받아 해당 friendship 레코드의 areWeFriend column을 true로 업데이트합니다.',
    }),
    ApiParam({
      name: 'friendshipId',
      description: '해당 친구 요청에 대한 friendship id',
      type: Number,
    }),
    ApiOkResponse({
      description: '친구 요청 수락 성공 시',
      type: UpdateFriendshipResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'FRIENDSHIP_NOT_FOUND',
      'FRIENDSHIP_ACCESS_FORBIDDEN',
      'FRIENDSHIP_REQUEST_ALREADY_ACCEPTED',
      'FRIENDSHIP_REQUEST_ACCEPT_FAILED',
    ]),
  ],
  rejectFriendshipRequest: [
    ApiOperation({
      summary: '받은 친구 요청 거절하기',
      description: 'friendshipId를 받아 해당 friendship 레코드를 삭제합니다.',
    }),
    ApiParam({
      name: 'friendshipId',
      description: '해당 친구 요청에 대한 friendship id',
      type: Number,
    }),
    ApiOkResponse({
      description: '친구 요청 거절 성공 시',
      type: DeleteFriendshipResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'FRIENDSHIP_NOT_FOUND',
      'FRIENDSHIP_ACCESS_FORBIDDEN',
      'FRIENDSHIP_REQUEST_ALREADY_ACCEPTED',
      'FRIENDSHIP_REQUEST_REJECT_FAILED',
    ]),
  ],
  cancelFriendshipRequest: [
    ApiOperation({
      summary: '보낸 친구 요청 취소하기',
      description: 'friendshipId를 받아 해당 friendship 레코드를 삭제합니다.',
    }),
    ApiParam({
      name: 'friendshipId',
      description: '해당 친구 요청에 대한 friendship id',
      type: Number,
    }),
    ApiOkResponse({
      description: '친구 요청 취소 성공 시',
      type: DeleteFriendshipResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'FRIENDSHIP_NOT_FOUND',
      'FRIENDSHIP_ACCESS_FORBIDDEN',
      'FRIENDSHIP_REQUEST_ALREADY_ACCEPTED',
      'FRIENDSHIP_REQUEST_CANCEL_FAILED',
    ]),
  ],
  deleteFriendship: [
    ApiOperation({
      summary: '친구 삭제하기',
      description:
        '이미 친구로 등록된 유저에 대해, friendshipId를 받아 해당 friendship 레코드를 삭제합니다.',
    }),
    ApiParam({
      name: 'friendshipId',
      description: '해당 친구 관계에 대한 friendship id',
    }),
    ApiOkResponse({
      description: '친구 삭제 성공 시',
      type: DeleteFriendshipResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'FRIENDSHIP_NOT_FOUND',
      'FRIENDSHIP_ACCESS_FORBIDDEN',
      'FRIENDSHIP_REQUEST_NOT_ACCEPTED',
      'FRIENDSHIP_DELETE_FAILED',
    ]),
  ],
};

export function FriendshipDocs(target: typeof FriendshipController) {
  for (const key in FriendshipDocsMap) {
    const methodDecorators =
      FriendshipDocsMap[key as keyof typeof FriendshipDocsMap];

    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
    if (descriptor) {
      for (const decorator of methodDecorators) {
        decorator(target.prototype, key, descriptor);
      }
      Object.defineProperty(target.prototype, key, descriptor);
    }
  }
  return target;
}
