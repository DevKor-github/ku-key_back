import {
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { throwKukeyException } from 'src/utils/exception.util';
import { CommentDocs } from 'src/decorators/docs/comment.decorator';

@Controller('comment')
@ApiTags('comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
@CommentDocs
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly reportService: ReportService,
  ) {}

  @Get('/my')
  async getMyCommentList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: CursorPageOptionsDto,
  ): Promise<GetMyCommentListResponseDto> {
    return await this.commentService.getMyCommentList(user, requestDto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async createComment(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Body() body: CreateCommentRequestDto,
    @Query('postId') postId: number,
    @Query('parentCommentId') parentCommentId?: number,
  ): Promise<GetCommentResponseDto> {
    if (!postId) {
      throwKukeyException(
        'VALIDATION_ERROR',
        'Invalid input value. Details: {No postId.}',
      );
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
  async updateComment(
    @User() user: AuthorizedUserDto,
    @Param('commentId') commentId: number,
    @Body() body: UpdateCommentRequestDto,
  ): Promise<GetCommentResponseDto> {
    return await this.commentService.updateComment(user, commentId, body);
  }

  @Delete('/:commentId')
  @UseInterceptors(TransactionInterceptor)
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
  async reportComment(
    @User() user: AuthorizedUserDto,
    @Param('commentId') commentId: number,
    @Body() body: CreateReportRequestDto,
  ): Promise<CreateReportResponseDto> {
    const comment = await this.commentService.getComment(commentId);
    if (!comment) {
      throwKukeyException('COMMENT_NOT_FOUND');
    }
    return await this.reportService.createReport(
      user.id,
      body.reason,
      comment.postId,
      commentId,
    );
  }
}
