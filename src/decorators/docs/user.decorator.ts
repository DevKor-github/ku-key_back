import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CheckCourseReviewReadingTicketResponseDto } from 'src/user/dto/check-course-review-reading-ticket.dto';
import { DeleteUserResponseDto } from 'src/user/dto/delete-user.dto';
import { GetPointHistoryResponseDto } from 'src/user/dto/get-point-history.dto';
import { GetProfileResponseDto } from 'src/user/dto/get-profile-response.dto';
import { PurchaseItemRequestDto } from 'src/user/dto/purchase-item-request.dto';
import { PurchaseItemResponseDto } from 'src/user/dto/purchase-item-response-dto';
import { SelectCharacterLevelRequestDto } from 'src/user/dto/select-character-level-request.dto';
import { SelectCharacterLevelResponseDto } from 'src/user/dto/select-character-level-response-dto';
import {
  SetExchangeDayReqeustDto,
  SetProfileRequestDto,
} from 'src/user/dto/set-profile-request.dto';
import { SetResponseDto } from 'src/user/dto/set-response.dto';
import {
  LanguageRequestDto,
  LanguageResponseDto,
} from 'src/user/dto/user-language.dto';
import { UserController } from 'src/user/user.controller';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';

type UserEndPoints = MethodNames<UserController>;

const UserDocsMap: Record<UserEndPoints, MethodDecorator[]> = {
  setProfile: [
    ApiOperation({
      summary: '프로필 설정',
      description: '프로필을 설정(변경) 합니다',
    }),
    ApiBody({
      type: SetProfileRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: '프로필 설정 성공',
      type: SetResponseDto,
    }),
    ApiKukeyExceptionResponse(['PROFILE_UPDATE_FAILED']),
  ],
  setExchangeDay: [
    ApiOperation({
      summary: '교환 남은 일자 설정',
      description: '교환학생 남은 일자를 설정(변경) 합니다',
    }),
    ApiBody({
      type: SetExchangeDayReqeustDto,
    }),
    ApiResponse({
      status: 200,
      description: '교환 남은 일자 설정 성공',
      type: SetResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'INVALID_DATE_RANGE',
      'EXCHANGE_DAY_UPDATE_FAILED',
    ]),
  ],
  getProfile: [
    ApiOperation({
      summary: '프로필 조회',
      description: '프로필을 조회 합니다',
    }),
    ApiResponse({
      status: 200,
      description: '프로필 조회 성공',
      type: GetProfileResponseDto,
    }),
  ],
  appendLanguage: [
    ApiOperation({
      summary: '언어 추가',
      description: '언어를 추가 합니다',
    }),
    ApiBody({
      type: LanguageRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '언어 추가 성공',
      type: LanguageResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'USER_NOT_FOUND',
      'LANGUAGE_LIMIT_EXCEEDED',
      'LANGUAGE_ALREADY_EXIST',
    ]),
  ],
  deleteLanguage: [
    ApiOperation({
      summary: '언어 삭제',
      description: '언어를 삭제 합니다',
    }),
    ApiBody({
      type: LanguageRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: '언어 삭제 성공',
      type: LanguageResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'USER_NOT_FOUND',
      'LANGUAGE_NOT_FOUND',
      'LANGUAGE_DELETE_FAILED',
    ]),
  ],
  getPointHistory: [
    ApiOperation({
      summary: '포인트 내역 조회',
      description: '포인트 획득/사용 내역을 조회 합니다',
    }),
    ApiResponse({
      status: 200,
      description: '포인트 내역 조회 성공',
      type: [GetPointHistoryResponseDto],
    }),
  ],
  purchaseItem: [
    ApiOperation({
      summary: '아이템 구매',
      description: '포인트 샵에서 아이템을 구매합니다.',
    }),
    ApiBody({ type: PurchaseItemRequestDto }),
    ApiResponse({
      status: 201,
      description: '아이템 구매 및 적용 성공',
      type: PurchaseItemResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'USER_NOT_FOUND',
      'CHARACTER_NOT_FOUND',
      'ITEM_METADATA_MISSING',
      'ITEM_POINT_NOT_MATCHED',
    ]),
  ],
  checkCourseReviewReadingTicket: [
    ApiOperation({
      summary: '강의평 열람권 만료 조회',
      description:
        '해당 사용자의 강의평 열람권이 만료되었는지 확인 후 만료되었으면 null, 만료되지 않았으면 강의평 열람권 만료일자를 반환합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '강의평 열람권 만료 조회 성공',
      type: CheckCourseReviewReadingTicketResponseDto,
    }),
    ApiKukeyExceptionResponse(['USER_NOT_FOUND']),
  ],
  selectCharacterLevel: [
    ApiOperation({
      summary: '캐릭터 레벨 선택',
      description:
        '현재 해금된 최대 레벨 이하의 캐릭터 레벨 중 하나를 선택합니다.',
    }),
    ApiBody({ type: SelectCharacterLevelRequestDto }),
    ApiResponse({
      status: 200,
      description: '캐릭터 레벨 선택 성공 및 선택된 캐릭터 레벨 반환',
      type: SelectCharacterLevelResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'USER_NOT_FOUND',
      'CHARACTER_LEVEL_NOT_UNLOCKED',
      'CHARACTER_LEVEL_SELECT_FAILED',
    ]),
  ],
  deleteUser: [
    ApiOperation({
      summary: '회원탈퇴',
      description: '사용자의 계정을 삭제합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '회원탈퇴 성공',
      type: DeleteUserResponseDto,
    }),
    ApiKukeyExceptionResponse(['USER_DELETE_FAILED']),
  ],
};

export function UserDocs(target: typeof UserController) {
  for (const key in UserDocsMap) {
    const methodDecorators = UserDocsMap[key as keyof typeof UserDocsMap];

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
