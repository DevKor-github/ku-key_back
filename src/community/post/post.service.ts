import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostRepository } from './post.repository';
import { BoardService } from '../board/board.service';
import {
  GetPostListWithBoardResponseDto,
  PostPreview,
} from './dto/get-post-list-with-board.dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreatePostRequestDto } from './dto/create-post.dto';
import { FileService } from 'src/common/file.service';
import { GetPostResponseDto } from './dto/get-post.dto';
import { UpdatePostRequestDto } from './dto/update-post.dto';
import { DeletePostResponseDto } from './dto/delete-post.dto';
import { DataSource } from 'typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { PostImageEntity } from 'src/entities/post-image.entity';
import { PostScrapRepository } from './post-scrap.repository';
import { ScrapPostResponseDto } from './dto/scrap-post.dto';
import {
  GetPostListResponseDto,
  PostPreviewWithBoardName,
} from './dto/get-post-list.dto';
import { PostScrapEntity } from 'src/entities/post-scrap.entity';
import {
  ReactPostRequestDto,
  ReactPostResponseDto,
} from './dto/react-post.dto';
import { PostReactionEntity } from 'src/entities/post-reaction.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserService } from 'src/user/user.service';
import { NoticeService } from 'src/notice/notice.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postScrapRepository: PostScrapRepository,
    private readonly boardService: BoardService,
    private readonly fileService: FileService,
    private readonly userService: UserService,
    private readonly noticeService: NoticeService,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getPostList(
    boardId: number,
    pageSize: number,
    pageNumber: number,
    keyword?: string,
  ): Promise<GetPostListWithBoardResponseDto> {
    const board = await this.boardService.getBoardById(boardId);
    if (!board) {
      throw new BadRequestException('Wrong BoardId!');
    }
    const posts = keyword
      ? await this.postRepository.getPostsByBoardIdwithKeyword(
          boardId,
          keyword,
          pageSize,
          pageNumber,
        )
      : await this.postRepository.getPostsByBoardId(
          boardId,
          pageSize,
          pageNumber,
        );
    const postList = new GetPostListWithBoardResponseDto(board, posts);
    this.makeThumbnailDirUrlInPostList(postList);

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

    if (!(await this.cacheManager.get(`${postId}-${user.id}`))) {
      await this.cacheManager.set(`${postId}-${user.id}`, new Date());
      const isViewsIncreased = await this.postRepository.increaseViews(postId);
      if (!isViewsIncreased) {
        console.log('Views Increase Failed!');
      }
      post.views += 1;
    }

    const postResponse = new GetPostResponseDto(post, user.id);
    this.makeImgDirUrlInPost(postResponse);

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
    this.makeImgDirUrlInPost(postResponse);

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

    if (post.boardId == 2 && post.commentCount > 0) {
      throw new BadRequestException('Cannot update answered post!');
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
    this.makeImgDirUrlInPost(postResponse);

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

    if (post.boardId == 2 && post.commentCount > 0) {
      throw new BadRequestException('Cannot delete answered post!');
    }

    for (const image of post.postImages) {
      await this.fileService.deleteFile(image.imgDir);
    }

    const isDeleted = await this.postRepository.deletePost(postId);
    if (!isDeleted) {
      throw new InternalServerErrorException('Post Delete Failed!');
    }

    return new DeletePostResponseDto(true);
  }

  async scrapPost(
    user: AuthorizedUserDto,
    postId: number,
  ): Promise<ScrapPostResponseDto> {
    if (!(await this.postRepository.isExistingPostId(postId))) {
      throw new BadRequestException('Wrong PostId!');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const scrap = await queryRunner.manager.findOne(PostScrapEntity, {
        where: {
          userId: user.id,
          postId: postId,
        },
      });

      if (scrap) {
        const deleteResult = await queryRunner.manager.delete(PostScrapEntity, {
          userId: user.id,
          postId: postId,
        });
        if (!deleteResult.affected) {
          throw new InternalServerErrorException('Scrap Cancel Failed!');
        }

        const updateResult = await queryRunner.manager.decrement(
          PostEntity,
          { id: postId },
          'scrapCount',
          1,
        );
        if (!updateResult.affected) {
          throw new InternalServerErrorException('Scrap Cancel Failed!');
        }
      } else {
        const newScrap = queryRunner.manager.create(PostScrapEntity, {
          userId: user.id,
          postId: postId,
        });
        await queryRunner.manager.save(newScrap);

        const updateResult = await queryRunner.manager.increment(
          PostEntity,
          { id: postId },
          'scrapCount',
          1,
        );
        if (!updateResult.affected) {
          throw new InternalServerErrorException('Scrap Failed!');
        }
      }
      await queryRunner.commitTransaction();

      return new ScrapPostResponseDto(scrap ? false : true);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyPostList(
    user: AuthorizedUserDto,
    pageSize: number,
    pageNumber: number,
  ): Promise<GetPostListResponseDto> {
    const posts = await this.postRepository.getPostsByUserId(
      user.id,
      pageSize,
      pageNumber,
    );
    const postList = new GetPostListResponseDto(posts);
    this.makeThumbnailDirUrlInPostList(postList);

    return postList;
  }

  async getAllPostList(
    pageSize: number,
    pageNumber: number,
    keyword?: string,
  ): Promise<GetPostListResponseDto> {
    const posts = keyword
      ? await this.postRepository.getAllPostsWithKeyword(
          keyword,
          pageSize,
          pageNumber,
        )
      : await this.postRepository.getAllPosts(pageSize, pageNumber);
    const postList = new GetPostListResponseDto(posts);
    this.makeThumbnailDirUrlInPostList(postList);

    return postList;
  }

  async getHotPostList(
    pageSize: number,
    pageNumber: number,
  ): Promise<GetPostListResponseDto> {
    const posts = await this.postRepository.getHotPosts(pageSize, pageNumber);
    const postList = new GetPostListResponseDto(posts);
    this.makeThumbnailDirUrlInPostList(postList);

    return postList;
  }

  async getScrapPostList(
    user: AuthorizedUserDto,
    pageSize: number,
    pageNumber: number,
  ): Promise<GetPostListResponseDto> {
    const postIds = await this.postScrapRepository.getScrapPostIdsWithUserId(
      user.id,
    );
    const posts = await this.postRepository.getScrapPostsByPostIds(
      postIds,
      pageSize,
      pageNumber,
    );
    const postList = new GetPostListResponseDto(posts);
    this.makeThumbnailDirUrlInPostList(postList);

    return postList;
  }

  async reactPost(
    user: AuthorizedUserDto,
    postId: number,
    requestDto: ReactPostRequestDto,
  ): Promise<ReactPostResponseDto> {
    const post = await this.postRepository.isExistingPostId(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }

    const ReactionColumn = [
      'goodReactionCount',
      'sadReactionCount',
      'amazingReactionCount',
      'angryReactionCount',
      'funnyReactionCount',
    ];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingReaction = await queryRunner.manager.findOne(
        PostReactionEntity,
        { where: { userId: user.id, postId: postId } },
      );

      if (!existingReaction) {
        const reaction = queryRunner.manager.create(PostReactionEntity, {
          userId: user.id,
          postId: postId,
          reaction: requestDto.reaction,
        });
        await queryRunner.manager.save(reaction);

        const updateResult = await queryRunner.manager.increment(
          PostEntity,
          { id: postId },
          ReactionColumn[requestDto.reaction],
          1,
        );
        if (!updateResult.affected) {
          throw new InternalServerErrorException('React Failed!');
        }

        const allReactionCountUpdateResult =
          await queryRunner.manager.increment(
            PostEntity,
            { id: postId },
            'allReactionCount',
            1,
          );
        if (!allReactionCountUpdateResult.affected) {
          throw new InternalServerErrorException('React Failed!');
        }

        if (post.allReactionCount + 1 >= 10) {
          await this.userService.changePoint(
            post.userId,
            10,
            'Hot post selected',
          );
          this.noticeService.emitNotice(
            post.userId,
            'Your Post is selected to Hot Board!',
          );
        }
      } else {
        if (existingReaction.reaction === requestDto.reaction) {
          throw new BadRequestException('Same Reaction!');
        }

        const decreasingUpdateResult = await queryRunner.manager.decrement(
          PostEntity,
          { id: postId },
          ReactionColumn[existingReaction.reaction],
          1,
        );
        if (!decreasingUpdateResult.affected) {
          throw new InternalServerErrorException('Reaction Change Failed!');
        }

        const updateReactionResult = await queryRunner.manager.update(
          PostReactionEntity,
          { id: existingReaction.id },
          { reaction: requestDto.reaction },
        );
        if (!updateReactionResult.affected) {
          throw new InternalServerErrorException('Reaction Change Failed!');
        }

        const increasingUpdateResult = await queryRunner.manager.increment(
          PostEntity,
          { id: postId },
          ReactionColumn[requestDto.reaction],
          1,
        );
        if (!increasingUpdateResult.affected) {
          throw new InternalServerErrorException('Reaction Change Failed!');
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return new ReactPostResponseDto(requestDto.reaction);
  }

  async isExistingPostId(postId: number): Promise<PostEntity> {
    return await this.postRepository.isExistingPostId(postId);
  }

  makeThumbnailDirUrlInPostList(
    postList: GetPostListResponseDto | GetPostListWithBoardResponseDto,
  ): void {
    postList.posts.map(
      (postPreview: PostPreviewWithBoardName | PostPreview) => {
        const imgDir = postPreview.thumbnailDir;
        if (imgDir) {
          postPreview.thumbnailDir = this.fileService.makeUrlByFileDir(imgDir);
        }
      },
    );
  }

  makeImgDirUrlInPost(post: GetPostResponseDto): void {
    post.imageDirs.map((image) => {
      image.imgDir = this.fileService.makeUrlByFileDir(image.imgDir);
    });
  }
}
