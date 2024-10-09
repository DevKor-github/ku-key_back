import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CreatePostRequestDto } from 'src/community/post/dto/create-post.dto';
import { DeletePostResponseDto } from 'src/community/post/dto/delete-post.dto';
import { GetPostListWithBoardResponseDto } from 'src/community/post/dto/get-post-list-with-board.dto';
import { GetPostListResponseDto } from 'src/community/post/dto/get-post-list.dto';
import { GetPostResponseDto } from 'src/community/post/dto/get-post.dto';
import {
  ReactPostRequestDto,
  ReactPostResponseDto,
} from 'src/community/post/dto/react-post.dto';
import { ScrapPostResponseDto } from 'src/community/post/dto/scrap-post.dto';
import { UpdatePostRequestDto } from 'src/community/post/dto/update-post.dto';
import { PostController } from 'src/community/post/post.controller';
import {
  CreateReportRequestDto,
  CreateReportResponseDto,
} from 'src/community/report/dto/create-report.dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';

type PostEndPoints = MethodNames<PostController>;

const PostDocsMap: Record<PostEndPoints, MethodDecorator[]> = {
  getPostList: [
    ApiOperation({
      summary: '게시판 별 게시글 목록 조회',
      description: '게시판 별로 게시글 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '게시글 목록 조회 성공',
      type: GetPostListWithBoardResponseDto,
    }),
    ApiKukeyExceptionResponse(['BOARD_NOT_FOUND']),
  ],
  getMyPostList: [
    ApiOperation({
      summary: '내가 쓴 글 목록 조회',
      description: '내가 쓴 글 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '내가 쓴 글 목록 조회 성공',
      type: GetPostListResponseDto,
    }),
  ],
  getAllPostList: [
    ApiOperation({
      summary: '전체 게시글 목록 조회',
      description: '전체 게시글 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '전체 게시글 목록 조회 성공',
      type: GetPostListResponseDto,
    }),
  ],
  getHotPostList: [
    ApiOperation({
      summary: 'hot 게시글 목록 조회',
      description: 'hot 게시글 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: 'hot 게시글 목록 조회 성공',
      type: GetPostListResponseDto,
    }),
  ],
  getScrapPostList: [
    ApiOperation({
      summary: '스크랩한 글 목록 조회',
      description: '스크랩한 글 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '스크랩한 글 목록 조회 성공',
      type: GetPostListResponseDto,
    }),
  ],
  getReactedPostList: [
    ApiOperation({
      summary: '반응 남긴 글 목록 조회',
      description: '반응을 남긴 글 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '반응 남긴 글 목록 조회 성공',
      type: GetPostListResponseDto,
    }),
  ],
  getPost: [
    ApiOperation({
      summary: '게시글 조회',
      description: '게시글 내용을 조회합니다.',
    }),
    ApiParam({
      name: 'postId',
      description: '게시글의 고유 ID',
    }),
    ApiResponse({
      status: 200,
      description: '게시글 조회 성공',
      type: GetPostResponseDto,
    }),
    ApiKukeyExceptionResponse(['POST_NOT_FOUND', 'POST_DELETED']),
  ],
  createPost: [
    ApiOperation({
      summary: '게시글 생성',
      description: '게시글을 생성합니다.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiQuery({
      name: 'boardId',
      description: '게시글을 생성하고자 하는 게시판 ID',
    }),
    ApiBody({
      type: CreatePostRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '게시글 생성 성공',
      type: GetPostResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'NOT_IMAGE_FILE',
      'TOO_MANY_IMAGES',
      'BOARD_NOT_FOUND',
      'FILE_UPLOAD_FAILED',
    ]),
  ],
  updatePost: [
    ApiOperation({
      summary: '게시글 수정',
      description: '게시글을 수정합니다.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'postId',
      description: '게시글의 고유 ID',
    }),
    ApiBody({
      type: UpdatePostRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: '게시글 수정 성공',
      type: GetPostResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'POST_NOT_FOUND',
      'POST_OWNERSHIP_REQUIRED',
      'POST_IN_QUESTION_BOARD',
      'NOT_IMAGE_FILE',
      'TOO_MANY_IMAGES',
      'FILE_UPLOAD_FAILED',
      'FILE_DELETE_FAILED',
    ]),
  ],
  deletePost: [
    ApiOperation({
      summary: '게시글 삭제',
      description: '게시글을 삭제합니다.',
    }),
    ApiParam({
      name: 'postId',
      description: '게시글의 고유 ID',
    }),
    ApiResponse({
      status: 200,
      description: '게시글 삭제 성공',
      type: DeletePostResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'POST_NOT_FOUND',
      'POST_OWNERSHIP_REQUIRED',
      'POST_IN_QUESTION_BOARD',
      'POST_DELETE_FAILED',
      'FILE_DELETE_FAILED',
    ]),
  ],
  scrapPost: [
    ApiOperation({
      summary: '게시글 스크랩',
      description:
        '게시글을 스크랩합니다. 만일 이미 스크랩한 게시글이라면 스크랩을 취소합니다.',
    }),
    ApiParam({
      name: 'postId',
      description: '게시글의 고유 ID',
    }),
    ApiResponse({
      status: 201,
      description: '게시글 스크랩(취소) 성공',
      type: ScrapPostResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'POST_NOT_FOUND',
      'SELF_POST_SCRAP_FORBIDDEN',
      'SCRAP_FAILED',
      'SCRAP_CANCEL_FAILED',
    ]),
  ],
  reactPost: [
    ApiOperation({
      summary: '게시글 반응',
      description:
        '게시글에 반응을 남깁니다. 만일 이미 반응을 남긴 게시글이라면 반응을 변경합니다.',
    }),
    ApiParam({
      name: 'postId',
      description: '게시글의 고유 ID',
    }),
    ApiBody({
      type: ReactPostRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '게시글 반응(변경) 성공',
      type: ReactPostResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'POST_NOT_FOUND',
      'SELF_POST_REACTION_FORBIDDEN',
      'REACT_FAILED',
      'SAME_REACTION',
      'REACTION_CHANGE_FAILED',
      'USER_NOT_FOUND',
    ]),
  ],
  reportPost: [
    ApiOperation({
      summary: '게시글 신고',
      description: '게시글을 신고합니다',
    }),
    ApiParam({
      name: 'postId',
      description: '게시글의 고유 ID',
    }),
    ApiBody({
      type: CreateReportRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '게시글 신고 성공',
      type: CreateReportResponseDto,
    }),
    ApiKukeyExceptionResponse(['POST_NOT_FOUND', 'ALREADY_REPORTED']),
  ],
};

export function PostDocs(target: typeof PostController) {
  for (const key in PostDocsMap) {
    const methodDecorators = PostDocsMap[key as keyof typeof PostDocsMap];

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
