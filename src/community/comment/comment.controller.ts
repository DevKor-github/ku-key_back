import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
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

@Controller('comment')
@ApiTags('comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
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
    @User() user: AuthorizedUserDto,
    @Body() body: CreateCommentRequestDto,
    @Query('postId') postId: number,
    @Query('parentCommentId') parentCommentId?: number,
  ): Promise<GetCommentResponseDto> {
    if (!postId) {
      throw new BadRequestException('No PostId!');
    }
    return await this.commentService.createComment(
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
    @User() user: AuthorizedUserDto,
    @Param('commentId') commentId: number,
  ): Promise<DeleteCommentResponseDto> {
    return await this.commentService.deleteComment(user, commentId);
  }
}
