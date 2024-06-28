import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
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
    return await this.commentService.createComment(
      user,
      postId,
      body,
      parentCommentId,
    );
  }
}
