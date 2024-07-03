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
import { DataSource } from 'typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { PostImageEntity } from 'src/entities/post-image.entity';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postImageRepository: PostImageRepository,
    private readonly boardService: BoardService,
    private readonly fileService: FileService,
    private readonly dataSource: DataSource,
  ) {}

  async getPostList(
    boardId: number,
    keyword?: string,
  ): Promise<GetPostListResponseDto> {
    const board = await this.boardService.getBoardById(boardId);
    if (!board) {
      throw new BadRequestException('Wrong BoardId!');
    }
    const posts = keyword
      ? await this.postRepository.getPostsByBoardIdwithKeyword(boardId, keyword)
      : await this.postRepository.getPostsByBoardId(boardId);
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
    const post =
      await this.postRepository.getPostByPostIdWithDeletedComment(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }
    if (post.deletedAt) {
      throw new BadRequestException('Deleted Post!');
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

    const board = await this.boardService.getBoardById(boardId);
    if (!board) {
      throw new BadRequestException('Wrong BoardId!');
    }

    let newPostId: number;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const post = queryRunner.manager.create(PostEntity, {
        userId: user.id,
        boardId: boardId,
        title: requestDto.title,
        content: requestDto.content,
        isAnonymous: requestDto.isAnonymous,
      });
      newPostId = (await queryRunner.manager.save(post)).id;

      for (const image of images) {
        const imgDir = await this.fileService.uploadFile(
          image,
          'PostImage',
          `${newPostId}`,
        );
        const postImage = queryRunner.manager.create(PostImageEntity, {
          postId: newPostId,
          imgDir: imgDir,
        });
        await queryRunner.manager.save(postImage);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    const createdPost =
      await this.postRepository.getPostByPostIdWithDeletedComment(newPostId);

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
    const post = await this.postRepository.getPostByPostId(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }
    if (post.userId !== user.id) {
      throw new BadRequestException("Other user's post!");
    }

    if (requestDto.imageUpdate) {
      for (const image of images) {
        if (!this.fileService.imagefilter(image)) {
          throw new BadRequestException('Only image file can be uploaded!');
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        PostEntity,
        { id: postId },
        {
          title: requestDto.title,
          content: requestDto.content,
          isAnonymous: requestDto.isAnonymous,
        },
      );

      if (requestDto.imageUpdate) {
        for (const image of post.postImages) {
          await this.fileService.deleteFile(image.imgDir);
          await queryRunner.manager.softDelete(PostImageEntity, {
            id: image.id,
          });
        }

        for (const image of images) {
          const imgDir = await this.fileService.uploadFile(
            image,
            'PostImage',
            `${postId}`,
          );
          const postImage = queryRunner.manager.create(PostImageEntity, {
            postId: postId,
            imgDir: imgDir,
          });
          await queryRunner.manager.save(postImage);
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    const updatedPost =
      await this.postRepository.getPostByPostIdWithDeletedComment(postId);
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
    const post = await this.postRepository.getPostByPostId(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }
    if (post.userId !== user.id) {
      throw new BadRequestException("Other user's post!");
    }

    for (const image of post.postImages) {
      await this.fileService.deleteFile(image.imgDir);
    }

    const isDeleted = await this.postRepository.deletePost(postId);
    if (!isDeleted) {
      throw new NotImplementedException('Post Delete Failed!');
    }

    return new DeletePostResponseDto(true);
  }

  async isExistingPostId(postId: number): Promise<boolean> {
    return await this.postRepository.isExistingPostId(postId);
  }
}
