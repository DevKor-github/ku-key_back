import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { ClubController } from 'src/home/club/club.controller';
import { CreateClubRequestDto } from 'src/home/club/dto/create-club-request-dto';
import { CreateClubResponseDto } from 'src/home/club/dto/create-club-response-dto';
import { DeleteClubResponseDto } from 'src/home/club/dto/delete-club-response-dto';
import { GetClubResponseDto } from 'src/home/club/dto/get-club-response.dto';
import { GetHotClubResponseDto } from 'src/home/club/dto/get-hot-club-response.dto';
import { GetRecommendClubResponseDto } from 'src/home/club/dto/get-recommend-club-response.dto';
import { UpdateClubRequestDto } from 'src/home/club/dto/update-club-request-dto';
import { UpdateClubResponseDto } from 'src/home/club/dto/update-club-response-dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';
import { GetClubDetailResponseDto } from 'src/home/club/dto/get-club-detail-response.dto';

type ClubEndPoints = MethodNames<ClubController>;

const ClubDocsMap: Record<ClubEndPoints, MethodDecorator[]> = {
  getClubs: [
    ApiOperation({
      summary: '동아리 목록 조회',
      description:
        '동아리 전체 목록을 조회하거나, 좋아요 여부, 소속/분과, 검색어(동아리명, 동아리 요약)로 필터링 및 좋아요 순으로 정렬하여 조회합니다.',
    }),
    ApiQuery({
      name: 'sortBy',
      description: '정렬 방식 (좋아요 순 : like)',
      required: false,
    }),
    ApiQuery({
      name: 'wishList',
      description: '좋아요 누른 동아리만 필터링 (true / false)',
      required: false,
    }),
    ApiQuery({
      name: 'category',
      description: '소속/분과별 필터링',
      required: false,
    }),
    ApiQuery({
      name: 'keyword',
      description: '동아리명/동아리 요약 검색 키워드',
      required: false,
    }),
    ApiQuery({
      name: 'isLogin',
      description: '로그인 여부',
      required: true,
    }),
    ApiOkResponse({
      description: '전체 혹은 필터링/정렬 된 동아리 목록 반환',
      isArray: true,
      type: GetClubResponseDto,
    }),
    ApiKukeyExceptionResponse(['LOGIN_REQUIRED']),
  ],
  getClubDetail: [
    ApiOperation({
      summary: '동아리 상세 조회',
      description: '동아리 상세 정보를 조회합니다.',
    }),
    ApiParam({
      name: 'clubId',
      description: 'club id',
      type: Number,
    }),
    ApiQuery({
      name: 'isLogin',
      description: '로그인 여부',
      required: true,
    }),
    ApiOkResponse({
      description: '동아리 상세 정보 반환',
      type: GetClubDetailResponseDto,
    }),
    ApiKukeyExceptionResponse(['LOGIN_REQUIRED', 'CLUB_NOT_FOUND']),
  ],
  toggleLikeClub: [
    ApiOperation({
      summary: '동아리 좋아요 등록/해제',
      description:
        '이미 동아리 좋아요 눌러져 있으면 해제, 그렇지 않다면 좋아요 등록',
    }),
    ApiParam({
      description: '좋아요 누를 동아리 id',
      name: 'clubId',
      type: Number,
    }),
    ApiCreatedResponse({
      description: '좋아요 여부 및 좋아요 개수가 업데이트된 동아리 정보 반환',
      type: GetClubResponseDto,
    }),
    ApiKukeyExceptionResponse(['CLUB_NOT_FOUND']),
  ],
  getHotClubs: [
    ApiOperation({
      summary: 'Hot Club 목록 조회',
      description:
        '최근 일주일 동안 좋아요 개수가 가장 많은 동아리 5개를 반환합니다.',
    }),
    ApiOkResponse({
      description: 'Hot Club 목록 5개 반환',
      isArray: true,
      type: GetHotClubResponseDto,
    }),
  ],
  getRecommendClubs: [
    ApiOperation({
      summary: 'Recommend Club 목록 조회',
      description:
        '최초에 무작위로 추천, 이후 좋아요를 누른 동아리가 있다면 그와 같은 카테고리 내에서 추천',
    }),
    ApiQuery({
      name: 'isLogin',
      description: '로그인 여부',
      required: true,
    }),
    ApiOkResponse({
      description: 'Recommend Club 목록 5개 반환',
      isArray: true,
      type: GetRecommendClubResponseDto,
    }),
    ApiKukeyExceptionResponse(['LOGIN_REQUIRED']),
  ],
  createClub: [
    ApiBearerAuth('accessToken'),
    ApiConsumes('multipart/form-data'),
    ApiOperation({
      summary: '동아리 생성',
      description: 'Admin page에서 새로운 동아리를 생성합니다.',
    }),
    ApiBody({ type: CreateClubRequestDto }),
    ApiCreatedResponse({
      description: '동아리 생성 성공',
      type: CreateClubResponseDto,
    }),
    ApiKukeyExceptionResponse(['NOT_IMAGE_FILE']),
  ],
  updateClub: [
    ApiBearerAuth('accessToken'),
    ApiConsumes('multipart/form-data'),
    ApiOperation({
      summary: '동아리 정보 수정',
      description: '동아리 id를 받아 admin page에서 동아리 정보를 수정합니다.',
    }),
    ApiParam({ name: 'clubId', description: '동아리 id' }),
    ApiBody({ type: UpdateClubRequestDto }),
    ApiOkResponse({
      description: '동아리 정보 수정 성공',
      type: UpdateClubResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'CLUB_NOT_FOUND',
      'NOT_IMAGE_FILE',
      'CLUB_UPDATE_FAILED',
    ]),
  ],
  deleteClub: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '동아리 정보 삭제',
      description: '동아리 id를 받아 admin page에서 동아리 정보를 삭제합니다.',
    }),
    ApiParam({ name: 'clubId', description: '동아리 id' }),
    ApiOkResponse({
      description: '동아리 정보 삭제 성공',
      type: DeleteClubResponseDto,
    }),
    ApiKukeyExceptionResponse(['CLUB_NOT_FOUND', 'CLUB_DELETE_FAILED']),
  ],
};

export function ClubDocs(target: typeof ClubController) {
  for (const key in ClubDocsMap) {
    const methodDecorators = ClubDocsMap[key as keyof typeof ClubDocsMap];

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
