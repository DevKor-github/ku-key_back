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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetPostListWithBoardRequestDto,
  GetPostListWithBoardResponseDto,
} from './dto/get-post-list-with-board.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreatePostRequestDto } from './dto/create-post.dto';
import { GetPostResponseDto } from './dto/get-post.dto';
import { UpdatePostRequestDto } from './dto/update-post.dto';
import { DeletePostResponseDto } from './dto/delete-post.dto';
import { ScrapPostResponseDto } from './dto/scrap-post.dto';
import {
  getAllPostListRequestDto,
  GetPostListRequestDto,
  GetPostListResponseDto,
} from './dto/get-post-list.dto';
import {
  ReactPostRequestDto,
  ReactPostResponseDto,
} from './dto/react-post.dto';

@Controller('post')
@ApiTags('post')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({
    summary: '게시판 별 게시글 목록 조회',
    description: '게시판 별로 게시글 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'boardId', description: '조회하고자 하는 게시판 ID' })
  @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드' })
  @ApiQuery({ name: 'pageSize', description: '한 페이지에 담길 게시글 수' })
  @ApiQuery({ name: 'pageNumber', description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    type: GetPostListWithBoardResponseDto,
  })
  async getPostList(
    @Query() requestDto: GetPostListWithBoardRequestDto,
  ): Promise<GetPostListWithBoardResponseDto> {
    return await this.postService.getPostList(
      requestDto.boardId,
      requestDto.pageSize,
      requestDto.pageNumber,
      requestDto.keyword,
    );
  }

  @Get('/my')
  @ApiOperation({
    summary: '내가 쓴 글 목록 조회',
    description: '내가 쓴 글 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'pageSize', description: '한 페이지에 담길 게시글 수' })
  @ApiQuery({ name: 'pageNumber', description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: '내가 쓴 글 목록 조회 성공',
    type: GetPostListResponseDto,
  })
  async getMyPostList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getMyPostList(
      user,
      requestDto.pageSize,
      requestDto.pageNumber,
    );
  }

  @Get('/all')
  @ApiOperation({
    summary: '전체 게시글 목록 조회',
    description: '전체 게시글 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드' })
  @ApiQuery({ name: 'pageSize', description: '한 페이지에 담길 게시글 수' })
  @ApiQuery({ name: 'pageNumber', description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: '전체 게시글 목록 조회 성공',
    type: GetPostListResponseDto,
  })
  async getAllPostList(
    @Query() requestDto: getAllPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getAllPostList(
      requestDto.pageSize,
      requestDto.pageNumber,
      requestDto.keyword,
    );
  }

  @Get('/hot')
  @ApiOperation({
    summary: 'hot 게시글 목록 조회',
    description: 'hot 게시글 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'pageSize', description: '한 페이지에 담길 게시글 수' })
  @ApiQuery({ name: 'pageNumber', description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: 'hot 게시글 목록 조회 성공',
    type: GetPostListResponseDto,
  })
  async getHotPostList(
    @Query() requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getHotPostList(
      requestDto.pageSize,
      requestDto.pageNumber,
    );
  }

  @Get('/scrap')
  @ApiOperation({
    summary: '스크랩한 글 목록 조회',
    description: '스크랩한 글 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'pageSize', description: '한 페이지에 담길 게시글 수' })
  @ApiQuery({ name: 'pageNumber', description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: '스크랩한 글 목록 조회 성공',
    type: GetPostListResponseDto,
  })
  async getScrapPostList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getScrapPostList(
      user,
      requestDto.pageSize,
      requestDto.pageNumber,
    );
  }

  @Get('/:postId')
  @ApiOperation({
    summary: '게시글 조회',
    description: '게시글 내용을 조회합니다.',
  })
  @ApiParam({
    name: 'postId',
    description: '게시글의 고유 ID',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 조회 성공',
    type: GetPostResponseDto,
  })
  async getPost(
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
  ): Promise<GetPostResponseDto> {
    return await this.postService.getPost(user, postId);
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
    if (!boardId) {
      throw new BadRequestException('No BoardId!');
    }
    return await this.postService.createPost(user, boardId, images, body);
  }

  @Patch('/:postId')
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({
    summary: '게시글 수정',
    description: '게시글을 수정합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'postId',
    description: '게시글의 고유 ID',
  })
  @ApiBody({
    type: UpdatePostRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    type: GetPostResponseDto,
  })
  async updatePost(
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() body: UpdatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    return await this.postService.updatePost(user, postId, images, body);
  }

  @Delete('/:postId')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글을 삭제합니다.',
  })
  @ApiParam({
    name: 'postId',
    description: '게시글의 고유 ID',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제 성공',
    type: DeletePostResponseDto,
  })
  async deletePost(
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
  ): Promise<DeletePostResponseDto> {
    return await this.postService.deletePost(user, postId);
  }

  @Post(':postId/scrap')
  @ApiOperation({
    summary: '게시글 스크랩',
    description:
      '게시글을 스크랩합니다. 만일 이미 스크랩한 게시글이라면 스크랩을 취소합니다.',
  })
  @ApiParam({
    name: 'postId',
    description: '게시글의 고유 ID',
  })
  @ApiResponse({
    status: 201,
    description: '게시글 스크랩(취소) 성공',
    type: ScrapPostResponseDto,
  })
  async scrapPost(
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
  ): Promise<ScrapPostResponseDto> {
    return await this.postService.scrapPost(user, postId);
  }

  @Post(':postId/reaction')
  @ApiOperation({
    summary: '게시글 반응',
    description:
      '게시글에 반응을 남깁니다. 만일 이미 반응을 남긴 게시글이라면 반응을 변경합니다.',
  })
  @ApiParam({
    name: 'postId',
    description: '게시글의 고유 ID',
  })
  @ApiBody({
    type: ReactPostRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '게시글 반응(변경) 성공',
    type: ReactPostResponseDto,
  })
  async reactPost(
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
    @Body() body: ReactPostRequestDto,
  ): Promise<ReactPostResponseDto> {
    return await this.postService.reactPost(user, postId, body);
  }
}
