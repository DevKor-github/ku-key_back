import {
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { throwKukeyException } from 'src/utils/exception.util';
import { PostDocs } from 'src/decorators/docs/post.decorator';

@Controller('post')
@ApiTags('post')
@UseGuards(JwtAuthGuard)
@PostDocs
@ApiBearerAuth('accessToken')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPostList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: GetPostListWithBoardRequestDto,
  ): Promise<GetPostListWithBoardResponseDto> {
    return await this.postService.getPostList(user, requestDto);
  }

  @Get('/my')
  async getMyPostList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getMyPostList(user, requestDto);
  }

  @Get('/all')
  async getAllPostList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: getAllPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getAllPostList(user, requestDto);
  }

  @Get('/hot')
  async getHotPostList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getHotPostList(user, requestDto);
  }

  @Get('/scrap')
  async getScrapPostList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getScrapPostList(user, requestDto);
  }

  @Get('/react')
  async getReactedPostList(
    @User() user: AuthorizedUserDto,
    @Query() requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    return await this.postService.getReactedPostList(user, requestDto);
  }

  @Get('/:postId')
  async getPost(
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
  ): Promise<GetPostResponseDto> {
    return await this.postService.getPost(user, postId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('images'))
  async createPost(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Query('boardId') boardId: number,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() body: CreatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    if (!boardId) {
      throwKukeyException(
        'VALIDATION_ERROR',
        'Invalid input value. Details: {No boardId.}',
      );
    }
    return await this.postService.createPost(
      transactionManager,
      user,
      boardId,
      images,
      body,
    );
  }

  @Patch('/:postId')
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('images'))
  async updatePost(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() body: UpdatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    return await this.postService.updatePost(
      transactionManager,
      user,
      postId,
      images,
      body,
    );
  }

  @Delete('/:postId')
  @UseInterceptors(TransactionInterceptor)
  async deletePost(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
  ): Promise<DeletePostResponseDto> {
    return await this.postService.deletePost(transactionManager, user, postId);
  }

  @Post('/:postId/scrap')
  @UseInterceptors(TransactionInterceptor)
  async scrapPost(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
  ): Promise<ScrapPostResponseDto> {
    return await this.postService.scrapPost(transactionManager, user, postId);
  }

  @Post('/:postId/reaction')
  @UseInterceptors(TransactionInterceptor)
  async reactPost(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('postId') postId: number,
    @Body() body: ReactPostRequestDto,
  ): Promise<ReactPostResponseDto> {
    return await this.postService.reactPost(
      transactionManager,
      user,
      postId,
      body,
    );
  }
}
