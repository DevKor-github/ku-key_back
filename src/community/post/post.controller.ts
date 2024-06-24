import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostService } from './post.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetPostListResponseDto } from './dto/get-post-list.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreatePostRequestDto } from './dto/create-post.dto';
import { GetPostResponseDto } from './dto/get-post.dto';

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

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({
    summary: '게시글 생성',
    description: '게시글을 생성합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'boardId',
    description: '게시글을 생성하고자 하는 게시판 ID',
  })
  @ApiBody({
    type: CreatePostRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '게시글 생성 성공',
    type: GetPostResponseDto,
  })
  async createPost(
    @User() user: AuthorizedUserDto,
    @Query('boardId') boardId: number,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() body: CreatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    return await this.postService.createPost(user, boardId, images, body);
  }
}
