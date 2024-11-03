import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CommentController } from 'src/community/comment/comment.controller';
import { CreateCommentRequestDto } from 'src/community/comment/dto/create-comment.dto';
import { DeleteCommentResponseDto } from 'src/community/comment/dto/delete-comment.dto';
import { GetCommentResponseDto } from 'src/community/comment/dto/get-comment.dto';
import { GetMyCommentListResponseDto } from 'src/community/comment/dto/get-myComment-list.dto';
import { LikeCommentResponseDto } from 'src/community/comment/dto/like-comment.dto';
import { UpdateCommentRequestDto } from 'src/community/comment/dto/update-comment.dto';
import {
  CreateReportRequestDto,
  CreateReportResponseDto,
} from 'src/community/report/dto/create-report.dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';

type CommentEndPoints = MethodNames<CommentController>;

const CommentDocsMap: Record<CommentEndPoints, MethodDecorator[]> = {
  getMyCommentList: [
    ApiOperation({
      summary: '내가 쓴 댓글 목록 조회',
      description: '내가 쓴 댓글 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '내가 쓴 댓글 목록 조회 성공',
      type: GetMyCommentListResponseDto,
    }),
  ],
  createComment: [
    ApiOperation({
      summary: '댓글 작성',
      description: '댓글을 작성합니다.',
    }),
    ApiQuery({
      name: 'postId',
      description: '댓글을 달고자 하는 게시글 ID',
    }),
    ApiQuery({
      name: 'parentCommentId',
      required: false,
      description: '답글을 달고자 하는 댓글 ID',
    }),
    ApiBody({
      type: CreateCommentRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '댓글 생성 성공',
      type: GetCommentResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'POST_NOT_FOUND',
      'INVALID_PARENT_COMMENT_REQUEST',
      'REPLY_TO_DIFFERENT_POST',
      'POST_UPDATE_FAILED',
    ]),
  ],
  updateComment: [
    ApiOperation({
      summary: '댓글 수정',
      description: '댓글을 수정합니다.',
    }),
    ApiParam({
      name: 'commentId',
      description: '댓글의 고유 ID',
    }),
    ApiBody({
      type: UpdateCommentRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: '댓글 수정 성공',
      type: GetCommentResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'COMMENT_NOT_FOUND',
      'COMMENT_OWNERSHIP_REQUIRED',
      'COMMENT_IN_QUESTION_BOARD',
      'COMMENT_UPDATE_FAILED',
    ]),
  ],
  deleteComment: [
    ApiOperation({
      summary: '댓글 삭제',
      description: '댓글을 삭제합니다.',
    }),
    ApiParam({
      name: 'commentId',
      description: '댓글의 고유 ID',
    }),
    ApiResponse({
      status: 200,
      description: '댓글 삭제 성공',
      type: DeleteCommentResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'COMMENT_NOT_FOUND',
      'COMMENT_OWNERSHIP_REQUIRED',
      'COMMENT_IN_QUESTION_BOARD',
      'COMMENT_DELETE_FAILED',
      'POST_UPDATE_FAILED',
    ]),
  ],
  likeComment: [
    ApiOperation({
      summary: '댓글 좋아요',
      description: '댓글을 좋아요 합니다. 이미 눌렀다면 취소합니다.',
    }),
    ApiParam({
      name: 'commentId',
      description: '댓글의 고유 ID',
    }),
    ApiResponse({
      status: 201,
      description: '댓글 좋아요(취소) 성공',
      type: LikeCommentResponseDto,
    }),
    ApiKukeyExceptionResponse([
      'COMMENT_NOT_FOUND',
      'SELF_COMMENT_LIKE_FORBIDDEN',
      'COMMENT_LIKE_CANCEL_FAILED',
    ]),
  ],
  reportComment: [
    ApiOperation({
      summary: '댓글 신고',
      description: '댓글을 신고합니다',
    }),
    ApiParam({
      name: 'commentId',
      description: '댓글의 고유 ID',
    }),
    ApiBody({
      type: CreateReportRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '댓글 신고 성공',
      type: CreateReportResponseDto,
    }),
    ApiKukeyExceptionResponse(['COMMENT_NOT_FOUND', 'ALREADY_REPORTED']),
  ],
};

export function CommentDocs(target: typeof CommentController) {
  for (const key in CommentDocsMap) {
    const methodDecorators = CommentDocsMap[key as keyof typeof CommentDocsMap];

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
