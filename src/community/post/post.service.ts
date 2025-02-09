import { Inject, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { BoardService } from '../board/board.service';
import {
  GetPostListWithBoardRequestDto,
  GetPostListWithBoardResponseDto,
} from './dto/get-post-list-with-board.dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreatePostRequestDto } from './dto/create-post.dto';
import { FileService } from 'src/common/file.service';
import { GetPostResponseDto } from './dto/get-post.dto';
import { UpdatePostRequestDto } from './dto/update-post.dto';
import { DeletePostResponseDto } from './dto/delete-post.dto';
import { EntityManager, Repository } from 'typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { PostImageEntity } from 'src/entities/post-image.entity';
import { PostScrapRepository } from './post-scrap.repository';
import { ScrapPostResponseDto } from './dto/scrap-post.dto';
import {
  getAllPostListRequestDto,
  GetPostListRequestDto,
  GetPostListResponseDto,
} from './dto/get-post-list.dto';
import { PostScrapEntity } from 'src/entities/post-scrap.entity';
import {
  ReactPostRequestDto,
  ReactPostResponseDto,
} from './dto/react-post.dto';
import { PostReactionEntity } from 'src/entities/post-reaction.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NoticeService } from 'src/notice/notice.service';
import { Notice } from 'src/notice/enum/notice.enum';
import { CursorPageMetaResponseDto } from 'src/common/dto/CursorPageResponse.dto';
import { PostPreview, PostPreviewWithBoardName } from './dto/post-preview.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PointService } from 'src/user/point.service';
import { throwKukeyException } from 'src/utils/exception.util';
import { UserBanService } from 'src/user/user-ban.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postScrapRepository: PostScrapRepository,
    @InjectRepository(PostReactionEntity)
    private readonly postReactionRepository: Repository<PostReactionEntity>,
    private readonly boardService: BoardService,
    private readonly fileService: FileService,
    private readonly pointService: PointService,
    private readonly noticeService: NoticeService,
    private readonly userBanService: UserBanService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getPostList(
    user: AuthorizedUserDto,
    requestDto: GetPostListWithBoardRequestDto,
  ): Promise<GetPostListWithBoardResponseDto> {
    const board = await this.boardService.getBoardById(requestDto.boardId);
    if (!board) {
      throwKukeyException('BOARD_NOT_FOUND');
    }
    const cursor = new Date('9999-12-31');
    if (requestDto.cursor) cursor.setTime(Number(requestDto.cursor));
    const posts = requestDto.keyword
      ? await this.postRepository.getPostsByBoardIdwithKeyword(
          requestDto.boardId,
          requestDto.keyword,
          requestDto.take + 1,
          cursor,
        )
      : await this.postRepository.getPostsByBoardId(
          requestDto.boardId,
          requestDto.take + 1,
          cursor,
        );

    const lastData = posts.length > requestDto.take ? posts.pop() : null;
    const meta: CursorPageMetaResponseDto = {
      hasNextData: lastData ? true : false,
      nextCursor: lastData
        ? (lastData.createdAt.getTime() + 1).toString().padStart(14, '0')
        : null,
    };
    const result = new GetPostListWithBoardResponseDto(
      board,
      posts,
      user.id,
      meta,
    );
    this.makeThumbnailDirUrlInPostList(result.data);

    return result;
  }

  async getPost(
    user: AuthorizedUserDto,
    postId: number,
  ): Promise<GetPostResponseDto> {
    const post =
      await this.postRepository.getPostByPostIdWithDeletedComment(postId);
    if (!post) {
      throwKukeyException('POST_NOT_FOUND');
    }
    if (post.deletedAt) {
      throwKukeyException('POST_DELETED');
    }

    if (!(await this.cacheManager.get(`postview-${postId}-${user.id}`))) {
      await this.cacheManager.set(
        `postview-${postId}-${user.id}`,
        new Date(),
        1000 * 60 * 30,
      );
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
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    boardId: number,
    images: Array<Express.Multer.File>,
    requestDto: CreatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    if (await this.userBanService.checkUserBan(user.id)) {
      throwKukeyException('USER_BANNED');
    }

    for (const image of images) {
      if (!this.fileService.imagefilter(image)) {
        throwKukeyException('NOT_IMAGE_FILE');
      }
    }

    if (images.length > 5) {
      throwKukeyException('TOO_MANY_IMAGES');
    }

    const board = await this.boardService.getBoardById(boardId);
    if (!board) {
      throwKukeyException('BOARD_NOT_FOUND');
    }

    const post = transactionManager.create(PostEntity, {
      userId: user.id,
      boardId: boardId,
      title: requestDto.title,
      content: requestDto.content,
      isAnonymous: requestDto.isAnonymous,
    });
    const newPostId = (await transactionManager.save(post)).id;

    for (const image of images) {
      const imgDir = await this.fileService.uploadCompressedImage(
        image,
        'PostImage',
        `${newPostId}`,
      );
      const postImage = transactionManager.create(PostImageEntity, {
        postId: newPostId,
        imgDir: imgDir,
      });
      await transactionManager.save(postImage);
    }

    const createdPost = await transactionManager.findOne(PostEntity, {
      where: { id: newPostId },
      withDeleted: true,
      relations: [
        'user.character',
        'postImages',
        'comments.user.character',
        'comments.commentLikes',
        'commentAnonymousNumbers',
        'postScraps',
        'postReactions',
      ],
    });

    const postResponse = new GetPostResponseDto(createdPost, user.id);
    this.makeImgDirUrlInPost(postResponse);

    return postResponse;
  }

  async updatePost(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    postId: number,
    images: Array<Express.Multer.File>,
    requestDto: UpdatePostRequestDto,
  ): Promise<GetPostResponseDto> {
    if (await this.userBanService.checkUserBan(user.id)) {
      throwKukeyException('USER_BANNED');
    }

    const post = await this.postRepository.getPostByPostId(postId);
    if (!post) {
      throwKukeyException('POST_NOT_FOUND');
    }
    if (post.userId !== user.id) {
      throwKukeyException('POST_OWNERSHIP_REQUIRED');
    }

    if (post.boardId == 2 && post.commentCount > 0) {
      throwKukeyException('POST_IN_QUESTION_BOARD');
    }

    if (requestDto.imageUpdate) {
      for (const image of images) {
        if (!this.fileService.imagefilter(image)) {
          throwKukeyException('NOT_IMAGE_FILE');
        }
      }

      if (images.length > 5) {
        throwKukeyException('TOO_MANY_IMAGES');
      }
    }

    await transactionManager.update(
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
        await transactionManager.softDelete(PostImageEntity, {
          id: image.id,
        });
      }

      for (const image of images) {
        const imgDir = await this.fileService.uploadCompressedImage(
          image,
          'PostImage',
          `${postId}`,
        );
        const postImage = transactionManager.create(PostImageEntity, {
          postId: postId,
          imgDir: imgDir,
        });
        await transactionManager.save(postImage);
      }
    }

    const updatedPost = await transactionManager.findOne(PostEntity, {
      where: { id: postId },
      withDeleted: true,
      relations: [
        'user.character',
        'postImages',
        'comments.user.character',
        'comments.commentLikes',
        'commentAnonymousNumbers',
        'postScraps',
        'postReactions',
      ],
    });
    const postResponse = new GetPostResponseDto(updatedPost, user.id);
    this.makeImgDirUrlInPost(postResponse);

    return postResponse;
  }

  async deletePost(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    postId: number,
  ): Promise<DeletePostResponseDto> {
    const post = await transactionManager.findOne(PostEntity, {
      where: { id: postId },
      relations: [
        'postImages',
        // 댓글에 대해 신고가 들어왔을때 대비해서 삭제x
        // 'comments.commentLikes',
        'postScraps',
        'postReactions',
        'commentAnonymousNumbers',
      ],
    });
    if (!post) {
      throwKukeyException('POST_NOT_FOUND');
    }

    this.checkDeleteAuthority(post, user);

    for (const image of post.postImages) {
      await this.fileService.deleteFile(image.imgDir);
    }

    const isDeleted = await transactionManager.softRemove(post);
    if (!isDeleted) {
      throwKukeyException('POST_DELETE_FAILED');
    }

    return new DeletePostResponseDto(true);
  }

  private checkDeleteAuthority(post: PostEntity, user: AuthorizedUserDto) {
    if (user.id !== -1) {
      if (post.userId !== user.id) {
        throwKukeyException('POST_OWNERSHIP_REQUIRED');
      }
      if (post.boardId == 2 && post.commentCount > 0) {
        throwKukeyException('POST_IN_QUESTION_BOARD');
      }
    }
  }

  async scrapPost(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    postId: number,
  ): Promise<ScrapPostResponseDto> {
    const post = await this.postRepository.isExistingPostId(postId);

    if (!post) {
      throwKukeyException('POST_NOT_FOUND');
    }

    if (post.userId === user.id) {
      throwKukeyException('SELF_POST_SCRAP_FORBIDDEN');
    }

    const scrap = await transactionManager.findOne(PostScrapEntity, {
      where: {
        userId: user.id,
        postId: postId,
      },
    });

    if (scrap) {
      const deleteResult = await transactionManager.delete(PostScrapEntity, {
        userId: user.id,
        postId: postId,
      });
      if (!deleteResult.affected) {
        throwKukeyException('SCRAP_CANCEL_FAILED');
      }

      const updateResult = await transactionManager.decrement(
        PostEntity,
        { id: postId },
        'scrapCount',
        1,
      );
      if (!updateResult.affected) {
        throwKukeyException('SCRAP_CANCEL_FAILED');
      }
    } else {
      const newScrap = transactionManager.create(PostScrapEntity, {
        userId: user.id,
        postId: postId,
      });
      await transactionManager.save(newScrap);

      const updateResult = await transactionManager.increment(
        PostEntity,
        { id: postId },
        'scrapCount',
        1,
      );
      if (!updateResult.affected) {
        throwKukeyException('SCRAP_FAILED');
      }
    }

    return new ScrapPostResponseDto(scrap ? false : true);
  }

  async getMyPostList(
    user: AuthorizedUserDto,
    requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    const cursor = new Date('9999-12-31');
    if (requestDto.cursor) cursor.setTime(Number(requestDto.cursor));

    const posts = await this.postRepository.getPostsByUserId(
      user.id,
      requestDto.take + 1,
      cursor,
    );

    const lastData = posts.length > requestDto.take ? posts.pop() : null;
    const meta: CursorPageMetaResponseDto = {
      hasNextData: lastData ? true : false,
      nextCursor: lastData
        ? (lastData.createdAt.getTime() + 1).toString().padStart(14, '0')
        : null,
    };
    const result = new GetPostListResponseDto(posts, user.id, meta);
    this.makeThumbnailDirUrlInPostList(result.data);

    return result;
  }

  async getAllPostList(
    user: AuthorizedUserDto,
    requestDto: getAllPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    const cursor = new Date('9999-12-31');
    if (requestDto.cursor) cursor.setTime(Number(requestDto.cursor));
    const posts = requestDto.keyword
      ? await this.postRepository.getAllPostsWithKeyword(
          requestDto.keyword,
          requestDto.take + 1,
          cursor,
        )
      : await this.postRepository.getAllPosts(requestDto.take + 1, cursor);

    const lastData = posts.length > requestDto.take ? posts.pop() : null;
    const meta: CursorPageMetaResponseDto = {
      hasNextData: lastData ? true : false,
      nextCursor: lastData
        ? (lastData.createdAt.getTime() + 1).toString().padStart(14, '0')
        : null,
    };
    const result = new GetPostListResponseDto(posts, user.id, meta);
    this.makeThumbnailDirUrlInPostList(result.data);

    return result;
  }

  async getHotPostList(
    user: AuthorizedUserDto,
    requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    const cursor = new Date('9999-12-31');
    if (requestDto.cursor) cursor.setTime(Number(requestDto.cursor));

    const posts = await this.postRepository.getHotPosts(
      requestDto.take + 1,
      cursor,
    );

    const lastData = posts.length > requestDto.take ? posts.pop() : null;
    const meta: CursorPageMetaResponseDto = {
      hasNextData: lastData ? true : false,
      nextCursor: lastData
        ? (lastData.createdAt.getTime() + 1).toString().padStart(14, '0')
        : null,
    };
    const result = new GetPostListResponseDto(posts, user.id, meta);
    this.makeThumbnailDirUrlInPostList(result.data);

    return result;
  }

  async getScrapPostList(
    user: AuthorizedUserDto,
    requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    const postIds = await this.postScrapRepository.getScrapPostIdsWithUserId(
      user.id,
    );

    const cursor = new Date('9999-12-31');
    if (requestDto.cursor) cursor.setTime(Number(requestDto.cursor));

    const posts = await this.postRepository.getPostsByPostIds(
      postIds,
      requestDto.take + 1,
      cursor,
    );

    const lastData = posts.length > requestDto.take ? posts.pop() : null;
    const meta: CursorPageMetaResponseDto = {
      hasNextData: lastData ? true : false,
      nextCursor: lastData
        ? (lastData.createdAt.getTime() + 1).toString().padStart(14, '0')
        : null,
    };
    const result = new GetPostListResponseDto(posts, user.id, meta);
    this.makeThumbnailDirUrlInPostList(result.data);

    return result;
  }

  async getReactedPostList(
    user: AuthorizedUserDto,
    requestDto: GetPostListRequestDto,
  ): Promise<GetPostListResponseDto> {
    const reactionList = await this.postReactionRepository.find({
      where: { userId: user.id },
    });
    const postIds = reactionList.map((reaction) => reaction.postId);

    const cursor = new Date('9999-12-31');
    if (requestDto.cursor) cursor.setTime(Number(requestDto.cursor));

    const posts = await this.postRepository.getPostsByPostIds(
      postIds,
      requestDto.take + 1,
      cursor,
    );

    const lastData = posts.length > requestDto.take ? posts.pop() : null;
    const meta: CursorPageMetaResponseDto = {
      hasNextData: lastData ? true : false,
      nextCursor: lastData
        ? (lastData.createdAt.getTime() + 1).toString().padStart(14, '0')
        : null,
    };
    const result = new GetPostListResponseDto(posts, user.id, meta);
    this.makeThumbnailDirUrlInPostList(result.data);

    return result;
  }

  async reactPost(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    postId: number,
    requestDto: ReactPostRequestDto,
  ): Promise<ReactPostResponseDto> {
    const post = await this.postRepository.isExistingPostId(postId);
    if (!post) {
      throwKukeyException('POST_NOT_FOUND');
    }

    if (post.userId === user.id) {
      throwKukeyException('SELF_POST_REACTION_FORBIDDEN');
    }

    const ReactionColumn = [
      'goodReactionCount',
      'sadReactionCount',
      'amazingReactionCount',
      'angryReactionCount',
      'funnyReactionCount',
    ];

    const existingReaction = await transactionManager.findOne(
      PostReactionEntity,
      { where: { userId: user.id, postId: postId } },
    );

    if (!existingReaction) {
      const reaction = transactionManager.create(PostReactionEntity, {
        userId: user.id,
        postId: postId,
        reaction: requestDto.reaction,
      });
      await transactionManager.save(reaction);

      const updateResult = await transactionManager.increment(
        PostEntity,
        { id: postId },
        ReactionColumn[requestDto.reaction],
        1,
      );
      if (!updateResult.affected) {
        throwKukeyException('REACT_FAILED');
      }

      const allReactionCountUpdateResult = await transactionManager.increment(
        PostEntity,
        { id: postId },
        'allReactionCount',
        1,
      );
      if (!allReactionCountUpdateResult.affected) {
        throwKukeyException('REACT_FAILED');
      }

      if (post.allReactionCount + 1 === 10) {
        await this.pointService.changePoint(
          post.userId,
          100,
          'Hot post selected',
          transactionManager,
        );
        await this.noticeService.emitNotice(
          post.userId,
          'Your Post is selected to Hot Board!',
          Notice.hotPost,
          post.id,
          transactionManager,
        );
      }
    } else {
      if (existingReaction.reaction === requestDto.reaction) {
        throwKukeyException('SAME_REACTION');
      }

      const decreasingUpdateResult = await transactionManager.decrement(
        PostEntity,
        { id: postId },
        ReactionColumn[existingReaction.reaction],
        1,
      );
      if (!decreasingUpdateResult.affected) {
        throwKukeyException('REACTION_CHANGE_FAILED');
      }

      const updateReactionResult = await transactionManager.update(
        PostReactionEntity,
        { id: existingReaction.id },
        { reaction: requestDto.reaction },
      );
      if (!updateReactionResult.affected) {
        throwKukeyException('REACTION_CHANGE_FAILED');
      }

      const increasingUpdateResult = await transactionManager.increment(
        PostEntity,
        { id: postId },
        ReactionColumn[requestDto.reaction],
        1,
      );
      if (!increasingUpdateResult.affected) {
        throwKukeyException('REACTION_CHANGE_FAILED');
      }
    }

    return new ReactPostResponseDto(requestDto.reaction);
  }

  async isExistingPostId(postId: number): Promise<PostEntity> {
    return await this.postRepository.isExistingPostId(postId);
  }

  makeThumbnailDirUrlInPostList(
    postList: PostPreview[] | PostPreviewWithBoardName[],
  ): void {
    postList.map((postPreview: PostPreviewWithBoardName | PostPreview) => {
      const imgDir = postPreview.thumbnailDir;
      if (imgDir) {
        postPreview.thumbnailDir = this.fileService.makeUrlByFileDir(imgDir);
      }
    });
  }

  makeImgDirUrlInPost(post: GetPostResponseDto): void {
    post.imageDirs.map((image) => {
      image.imgDir = this.fileService.makeUrlByFileDir(image.imgDir);
    });
  }
}
