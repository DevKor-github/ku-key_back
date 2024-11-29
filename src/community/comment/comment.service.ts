import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCommentRequestDto } from './dto/create-comment.dto';
import { PostService } from '../post/post.service';
import { GetCommentResponseDto } from './dto/get-comment.dto';
import { UpdateCommentRequestDto } from './dto/update-comment.dto';
import { DeleteCommentResponseDto } from './dto/delete-comment.dto';
import { EntityManager, Not, Repository } from 'typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { PostEntity } from 'src/entities/post.entity';
import { LikeCommentResponseDto } from './dto/like-comment.dto';
import { CommentLikeEntity } from 'src/entities/comment-like.entity';
import { CommentAnonymousNumberEntity } from 'src/entities/comment-anonymous-number.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeService } from 'src/notice/notice.service';
import { Notice } from 'src/notice/enum/notice.enum';
import { CursorPageOptionsDto } from 'src/common/dto/CursorPageOptions.dto';
import { CursorPageMetaResponseDto } from 'src/common/dto/CursorPageResponse.dto';
import { GetMyCommentListResponseDto } from './dto/get-myComment-list.dto';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService,
    @InjectRepository(CommentAnonymousNumberEntity)
    private readonly commentAnonymousNumberRepository: Repository<CommentAnonymousNumberEntity>,
    private readonly noticeService: NoticeService,
  ) {}

  async getMyCommentList(
    user: AuthorizedUserDto,
    requestDto: CursorPageOptionsDto,
  ): Promise<GetMyCommentListResponseDto> {
    const cursor = new Date('9999-12-31');
    if (requestDto.cursor) cursor.setTime(Number(requestDto.cursor));

    const comments = await this.commentRepository.getCommentsByUserId(
      user.id,
      requestDto.take + 1,
      cursor,
    );

    const lastData = comments.length > requestDto.take ? comments.pop() : null;
    const meta: CursorPageMetaResponseDto = {
      hasNextData: lastData ? true : false,
      nextCursor: lastData
        ? (lastData.createdAt.getTime() + 1).toString().padStart(14, '0')
        : null,
    };
    const result = new GetMyCommentListResponseDto(comments, meta);

    return result;
  }

  async createComment(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    postId: number,
    requestDto: CreateCommentRequestDto,
    parentCommentId?: number,
  ) {
    const post = await this.postService.isExistingPostId(postId);
    if (!post) {
      throwKukeyException('POST_NOT_FOUND');
    }
    if (parentCommentId) {
      const parentComment =
        await this.commentRepository.getCommentByCommentId(parentCommentId);
      if (!parentComment) {
        throwKukeyException('INVALID_PARENT_COMMENT_REQUEST');
      }
      if (postId !== Number(parentComment.postId)) {
        throwKukeyException('REPLY_TO_DIFFERENT_POST');
      }
      if (parentComment.parentCommentId) {
        parentCommentId = parentComment.parentCommentId;
      }
    }

    const comment = transactionManager.create(CommentEntity, {
      userId: user.id,
      postId: postId,
      content: requestDto.content,
      isAnonymous: requestDto.isAnonymous,
    });
    if (parentCommentId) {
      comment.parentCommentId = parentCommentId;
    }
    const newCommentId = (await transactionManager.save(comment)).id;

    const updateResult = await transactionManager.increment(
      PostEntity,
      { id: postId },
      'commentCount',
      1,
    );
    if (!updateResult.affected) {
      throwKukeyException('POST_UPDATE_FAILED');
    }

    let anonymousNumber: number;
    const myAnonymousNumber = await transactionManager.findOne(
      CommentAnonymousNumberEntity,
      { where: { postId: postId, userId: user.id } },
    );
    if (myAnonymousNumber) {
      anonymousNumber = myAnonymousNumber.anonymousNumber;
    } else {
      if (post.isAnonymous && post.userId === user.id) {
        anonymousNumber = 0;
      } else {
        const recentAnonymousNumber = await transactionManager.findOne(
          CommentAnonymousNumberEntity,
          {
            where: { postId: postId, anonymousNumber: Not(0) },
            order: { createdAt: 'DESC' },
          },
        );
        if (!recentAnonymousNumber) {
          anonymousNumber = 1;
        } else {
          anonymousNumber = recentAnonymousNumber.anonymousNumber + 1;
        }
      }
      const newAnonymousNumber = transactionManager.create(
        CommentAnonymousNumberEntity,
        {
          userId: user.id,
          postId: postId,
          anonymousNumber: anonymousNumber,
        },
      );
      await transactionManager.save(newAnonymousNumber);
    }

    const createdComment = await transactionManager.findOne(CommentEntity, {
      where: { id: newCommentId },
      relations: ['parentComment', 'user.character', 'commentLikes', 'post'],
    });
    if (post.userId !== user.id) {
      await this.noticeService.emitNotice(
        post.userId,
        'New comment was posted on your post!',
        Notice.commentOnPost,
        post.id,
        transactionManager,
      );
    }

    if (
      createdComment.parentCommentId &&
      createdComment.parentComment.userId !== user.id
    ) {
      await this.noticeService.emitNotice(
        createdComment.parentComment.userId,
        'New reply was posted on your comment!',
        Notice.commentOnComment,
        post.id,
        transactionManager,
      );
    }

    return new GetCommentResponseDto(createdComment, user.id, anonymousNumber);
  }

  async updateComment(
    user: AuthorizedUserDto,
    commentId: number,
    requestDto: UpdateCommentRequestDto,
  ): Promise<GetCommentResponseDto> {
    const comment =
      await this.commentRepository.getCommentByCommentId(commentId);
    if (!comment) {
      throwKukeyException('COMMENT_NOT_FOUND');
    }
    if (comment.userId !== user.id) {
      throwKukeyException('COMMENT_OWNERSHIP_REQUIRED');
    }

    const post = await this.postService.isExistingPostId(comment.postId);
    if (Number(post.boardId) === 2) {
      throwKukeyException('COMMENT_IN_QUESTION_BOARD');
    }

    const isUpdated = await this.commentRepository.updateComment(
      commentId,
      requestDto.content,
      requestDto.isAnonymous,
    );
    if (!isUpdated) {
      throwKukeyException('COMMENT_UPDATE_FAILED');
    }

    const updatedComment =
      await this.commentRepository.getCommentByCommentId(commentId);
    const anonymousNumber = (
      await this.commentAnonymousNumberRepository.findOne({
        where: {
          postId: updatedComment.postId,
          userId: user.id,
        },
      })
    ).anonymousNumber;

    return new GetCommentResponseDto(updatedComment, user.id, anonymousNumber);
  }

  async deleteComment(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    commentId: number,
  ): Promise<DeleteCommentResponseDto> {
    const comment =
      await this.commentRepository.getCommentByCommentIdWithLike(commentId);
    if (!comment) {
      throwKukeyException('COMMENT_NOT_FOUND');
    }
    if (comment.userId !== user.id) {
      throwKukeyException('COMMENT_OWNERSHIP_REQUIRED');
    }

    const post = await this.postService.isExistingPostId(comment.postId);
    if (Number(post.boardId) === 2) {
      throwKukeyException('COMMENT_IN_QUESTION_BOARD');
    }

    const deleteResult = await transactionManager.softRemove(
      CommentEntity,
      comment,
    );
    if (!deleteResult.deletedAt) {
      throwKukeyException('COMMENT_DELETE_FAILED');
    }

    const updateResult = await transactionManager.decrement(
      PostEntity,
      { id: comment.postId },
      'commentCount',
      1,
    );
    if (!updateResult.affected) {
      throwKukeyException('POST_UPDATE_FAILED');
    }

    return new DeleteCommentResponseDto(true);
  }

  async likeComment(
    tranasactionManager: EntityManager,
    user: AuthorizedUserDto,
    commentId: number,
  ): Promise<LikeCommentResponseDto> {
    const comment = await this.commentRepository.isExistingCommentId(commentId);
    if (!comment) {
      throwKukeyException('COMMENT_NOT_FOUND');
    }

    if (comment.userId === user.id) {
      throwKukeyException('SELF_COMMENT_LIKE_FORBIDDEN');
    }

    const like = await tranasactionManager.findOne(CommentLikeEntity, {
      where: {
        userId: user.id,
        commentId: commentId,
      },
    });

    if (like) {
      const deleteResult = await tranasactionManager.delete(CommentLikeEntity, {
        userId: user.id,
        commentId: commentId,
      });
      if (!deleteResult.affected) {
        throwKukeyException('COMMENT_LIKE_CANCEL_FAILED');
      }

      const updateResult = await tranasactionManager.decrement(
        CommentEntity,
        { id: commentId },
        'likeCount',
        1,
      );
      if (!updateResult.affected) {
        throwKukeyException('COMMENT_LIKE_CANCEL_FAILED');
      }
    } else {
      const newLike = tranasactionManager.create(CommentLikeEntity, {
        userId: user.id,
        commentId: commentId,
      });
      await tranasactionManager.save(newLike);

      const updateResult = await tranasactionManager.increment(
        CommentEntity,
        { id: commentId },
        'likeCount',
        1,
      );
      if (!updateResult.affected) {
        throwKukeyException('COMMENT_LIKE_CANCEL_FAILED');
      }
    }

    return new LikeCommentResponseDto(!like);
  }

  async getComment(commentId: number): Promise<CommentEntity> {
    return await this.commentRepository.getCommentByCommentId(commentId);
  }
}
