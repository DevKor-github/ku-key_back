import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentService } from './comment.service';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCommentRequestDto } from './dto/create-comment.dto';
import { GetCommentResponseDto } from './dto/get-comment.dto';
import { UpdateCommentRequestDto } from './dto/update-comment.dto';
import { DeleteCommentResponseDto } from './dto/delete-comment.dto';
import { LikeCommentResponseDto } from './dto/like-comment.dto';
import {
  CreateReportRequestDto,
  CreateReportResponseDto,
} from '../report/dto/create-report.dto';
import { ReportService } from '../report/report.service';
import { CursorPageOptionsDto } from 'src/common/dto/CursorPageOptions.dto';
import { GetMyCommentListResponseDto } from './dto/get-myComment-list.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';

@Controller('comment')
@ApiTags('comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly reportService: ReportService,
  ) {}

  @Get('/my')
  @ApiOperation({
    summary: '내가 쓴 댓글 목록 조회',
    description: '내가 쓴 댓글 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '내가 쓴 댓글 목록 조회 성공',
    type: GetMyCommentListResponseDto,
  })
  async getMyCommentList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: CursorPageOptionsDto,
  ): Promise<GetMyCommentListResponseDto> {
    return await this.commentService.getMyCommentList(user, requestDto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '댓글 작성',
    description: '댓글을 작성합니다.',
  })
  @ApiQuery({
    name: 'postId',
    description: '댓글을 달고자 하는 게시글 ID',
  })
  @ApiQuery({
    name: 'parentCommentId',
    required: false,
    description: '답글을 달고자 하는 댓글 ID',
  })
  @ApiBody({
    type: CreateCommentRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '댓글 생성 성공',
    type: GetCommentResponseDto,
  })
  async createComment(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Body() body: CreateCommentRequestDto,
    @Query('postId') postId: number,
    @Query('parentCommentId') parentCommentId?: number,
  ): Promise<GetCommentResponseDto> {
    if (!postId) {
      throw new BadRequestException('No PostId!');
    }
    return await this.commentService.createComment(
      transactionManager,
      user,
      postId,
      body,
      parentCommentId,
    );
  }

  @Patch('/:commentId')
  @ApiOperation({
    summary: '댓글 수정',
    description: '댓글을 수정합니다.',
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글의 고유 ID',
  })
  @ApiBody({
    type: UpdateCommentRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '댓글 수정 성공',
    type: GetCommentResponseDto,
  })
  async updateComment(
    @User() user: AuthorizedUserDto,
    @Param('commentId') commentId: number,
    @Body() body: UpdateCommentRequestDto,
  ): Promise<GetCommentResponseDto> {
    return await this.commentService.updateComment(user, commentId, body);
  }

  @Delete('/:commentId')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '댓글 삭제',
    description: '댓글을 삭제합니다.',
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글의 고유 ID',
  })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제 성공',
    type: DeleteCommentResponseDto,
  })
  async deleteComment(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('commentId') commentId: number,
  ): Promise<DeleteCommentResponseDto> {
    return await this.commentService.deleteComment(
      transactionManager,
      user,
      commentId,
    );
  }

  @Post('/:commentId/like')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '댓글 좋아요',
    description: '댓글을 좋아요 합니다. 이미 눌렀다면 취소합니다.',
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글의 고유 ID',
  })
  @ApiResponse({
    status: 201,
    description: '댓글 좋아요(취소) 성공',
    type: LikeCommentResponseDto,
  })
  async likeComment(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('commentId') commentId: number,
  ): Promise<LikeCommentResponseDto> {
    return await this.commentService.likeComment(
      transactionManager,
      user,
      commentId,
    );
  }

  @Post('/:commentId/report')
  @ApiOperation({
    summary: '댓글 신고',
    description: '댓글을 신고합니다',
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글의 고유 ID',
  })
  @ApiBody({
    type: CreateReportRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '댓글 신고 성공',
    type: CreateReportResponseDto,
  })
  async reportPost(
    @User() user: AuthorizedUserDto,
    @Param('commentId') commentId: number,
    @Body() body: CreateReportRequestDto,
  ): Promise<CreateReportResponseDto> {
    const comment = await this.commentService.getComment(commentId);
    if (!comment) {
      throw new BadRequestException('Wrong CommentId!');
    }
    return await this.reportService.createReport(
      user.id,
      body.reason,
      comment.postId,
      commentId,
    );
  }
}
