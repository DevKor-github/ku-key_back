import { BadRequestException, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostImageRepository } from './post-image.repository';
import { BoardService } from '../board/board.service';
import { GetPostListResponseDto } from './dto/get-post-list.dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreatePostRequestDto } from './dto/create-post.dto';
import { FileService } from 'src/common/file.service';
import { GetPostResponseDto } from './dto/get-post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postImageRepository: PostImageRepository,
    private readonly boardService: BoardService,
    private readonly fileService: FileService,
  ) {}

  async getPostList(boardId: number): Promise<GetPostListResponseDto> {
    const board = await this.boardService.getBoardbyId(boardId);
    if (!board) {
      throw new BadRequestException('Wrong BoardId!');
    }
    const posts = await this.postRepository.getPostsbyBoardId(boardId);
    return new GetPostListResponseDto(board, posts);
  }

  async getPost(
    user: AuthorizedUserDto,
    postId: number,
  ): Promise<GetPostResponseDto> {
    const post = await this.postRepository.getPostbyPostId(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }
    return new GetPostResponseDto(post, user.id);
  }

  async createPost(
    user: AuthorizedUserDto,
    boardId: number,
    images: Array<Express.Multer.File>,
    requestDto: CreatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    const post = await this.postRepository.createPost(
      user.id,
      boardId,
      requestDto.title,
      requestDto.content,
      requestDto.isAnonymous,
    );
    const createdPost = await this.postRepository.getPostbyPostId(post.id);
    for (const image of images) {
      const imgDir = await this.fileService.uploadFile(
        image,
        'PostImage',
        `${post.id}`,
      );
      const postImage = await this.postImageRepository.createPostImage(
        post.id,
        imgDir,
      );
      createdPost.postImages.push(postImage);
    }
    return new GetPostResponseDto(createdPost, user.id);
  }
}
