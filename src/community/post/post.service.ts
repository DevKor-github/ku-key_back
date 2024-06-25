import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostImageRepository } from './post-image.repository';
import { BoardService } from '../board/board.service';
import { GetPostListResponseDto } from './dto/get-post-list.dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreatePostRequestDto } from './dto/create-post.dto';
import { FileService } from 'src/common/file.service';
import { GetPostResponseDto } from './dto/get-post.dto';
import { UpdatePostRequestDto } from './dto/update-post.dto';
import { DeletePostResponseDto } from './dto/delete-post.dto';

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
    const postList = new GetPostListResponseDto(board, posts);
    postList.posts.map((postPreview) => {
      const imgDir = postPreview.thumbnailDir;
      if (imgDir) {
        postPreview.thumbnailDir = this.fileService.makeUrlByFileDir(imgDir);
      }
    });

    return postList;
  }

  async getPost(
    user: AuthorizedUserDto,
    postId: number,
  ): Promise<GetPostResponseDto> {
    const post = await this.postRepository.getPostbyPostId(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }
    const postResponse = new GetPostResponseDto(post, user.id);
    postResponse.imageDirs.map((image) => {
      image.imgDir = this.fileService.makeUrlByFileDir(image.imgDir);
    });

    return postResponse;
  }

  async createPost(
    user: AuthorizedUserDto,
    boardId: number,
    images: Array<Express.Multer.File>,
    requestDto: CreatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    for (const image of images) {
      if (!this.fileService.imagefilter(image)) {
        throw new BadRequestException('Only image file can be uploaded!');
      }
    }

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
    const postResponse = new GetPostResponseDto(createdPost, user.id);
    postResponse.imageDirs.map((image) => {
      image.imgDir = this.fileService.makeUrlByFileDir(image.imgDir);
    });

    return postResponse;
  }

  async updatePost(
    user: AuthorizedUserDto,
    postId: number,
    images: Array<Express.Multer.File>,
    requestDto: UpdatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    const post = await this.postRepository.getPostbyPostId(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }
    if (post.userId !== user.id) {
      throw new BadRequestException("Other user's post!");
    }

    if (requestDto.ImageUpdate) {
      for (const image of images) {
        if (!this.fileService.imagefilter(image)) {
          throw new BadRequestException('Only image file can be uploaded!');
        }
      }
    }

    const isUpdated = await this.postRepository.updatePost(
      postId,
      requestDto.title,
      requestDto.content,
      requestDto.isAnonymous,
    );
    if (!isUpdated) {
      throw new NotImplementedException('Post Update Failed!');
    }

    if (requestDto.ImageUpdate) {
      for (const image of post.postImages) {
        await this.fileService.deleteFile(image.imgDir);
        const isImageDeleted = await this.postImageRepository.deletePostImage(
          image.id,
        );
        if (!isImageDeleted) {
          throw new NotImplementedException('Image Update Failed!');
        }
      }

      for (const image of images) {
        const imgDir = await this.fileService.uploadFile(
          image,
          'PostImage',
          `${post.id}`,
        );
        await this.postImageRepository.createPostImage(post.id, imgDir);
      }
    }

    const updatedPost = await this.postRepository.getPostbyPostId(postId);
    const postResponse = new GetPostResponseDto(updatedPost, user.id);
    postResponse.imageDirs.map((image) => {
      image.imgDir = this.fileService.makeUrlByFileDir(image.imgDir);
    });

    return postResponse;
  }

  async deletePost(
    user: AuthorizedUserDto,
    postId: number,
  ): Promise<DeletePostResponseDto> {
    const post = await this.postRepository.getPostbyPostId(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }
    if (post.userId !== user.id) {
      throw new BadRequestException("Other user's post!");
    }

    for (const image of post.postImages) {
      await this.fileService.deleteFile(image.imgDir);
      const isImageDeleted = await this.postImageRepository.deletePostImage(
        image.id,
      );
      if (!isImageDeleted) {
        throw new NotImplementedException('Image Delete Failed!');
      }
    }

    const isDeleted = await this.postRepository.deletePost(postId);
    if (!isDeleted) {
      throw new NotImplementedException('Post Delete Failed!');
    }

    return new DeletePostResponseDto(true);
  }
}
