import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostService } from './post.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetPostListResponseDto } from './dto/get-post-list.dto';

@Controller('post')
@ApiTags('post')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: '게시판 별로 게시글 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'boardId', description: '조회하고자 하는 게시판 ID' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    type: GetPostListResponseDto,
  })
  async getPostList(
    @Query('boardId') boardId: number,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getPostList(boardId);
  }
}
