import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCommentRequestDto } from './dto/create-comment.dto';
import { PostService } from '../post/post.service';
import { GetCommentResponseDto } from './dto/get-comment.dto';
import { UpdateCommentRequestDto } from './dto/update-comment.dto';
import { DeleteCommentResponseDto } from './dto/delete-comment.dto';
import { DataSource, Not, Repository } from 'typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { PostEntity } from 'src/entities/post.entity';
import { LikeCommentResponseDto } from './dto/like-comment.dto';
import { CommentLikeEntity } from 'src/entities/comment-like.entity';
import { CommentAnonymousNumberEntity } from 'src/entities/comment-anonymous-number.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService,
    private readonly dataSource: DataSource,
    @InjectRepository(CommentAnonymousNumberEntity)
    private readonly commentAnonymousNumberRepository: Repository<CommentAnonymousNumberEntity>,
  ) {}

  async createComment(
    user: AuthorizedUserDto,
    postId: number,
    requestDto: CreateCommentRequestDto,
    parentCommentId?: number,
  ) {
    const post = await this.postService.isExistingPostId(postId);
    if (!post) {
      throw new BadRequestException('Wrong PostId!');
    }
    if (parentCommentId) {
      const parentComment =
        await this.commentRepository.getCommentByCommentId(parentCommentId);
      if (!parentComment) {
        throw new BadRequestException('Wrong ParentCommentId!');
      }
      if (postId !== Number(parentComment.postId)) {
        throw new BadRequestException("Cannot create other post's reply!");
      }
      if (parentComment.parentCommentId) {
        parentCommentId = parentComment.parentCommentId;
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = queryRunner.manager.create(CommentEntity, {
        userId: user.id,
        postId: postId,
        content: requestDto.content,
        isAnonymous: requestDto.isAnonymous,
      });
      if (parentCommentId) {
        comment.parentCommentId = parentCommentId;
      }
      const createResult = await queryRunner.manager.save(comment);

      const updateResult = await queryRunner.manager.increment(
        PostEntity,
        { id: postId },
        'commentCount',
        1,
      );
      if (!updateResult.affected) {
        throw new InternalServerErrorException('Comment Create Failed!');
      }

      let anonymousNumber: number;
      const myAnonymousNumber = await queryRunner.manager.findOne(
        CommentAnonymousNumberEntity,
        { where: { postId: postId, userId: user.id } },
      );
      if (myAnonymousNumber) {
        anonymousNumber = myAnonymousNumber.anonymousNumber;
      } else {
        if (post.userId === user.id) {
          anonymousNumber = 0;
        } else {
          const recentAnonymousNumber = await queryRunner.manager.findOne(
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
      }
      const newAnonymousNumber = queryRunner.manager.create(
        CommentAnonymousNumberEntity,
        {
          userId: user.id,
          postId: postId,
          anonymousNumber: anonymousNumber,
        },
      );
      await queryRunner.manager.save(newAnonymousNumber);

      await queryRunner.commitTransaction();

      const createdComment = await this.commentRepository.getCommentByCommentId(
        createResult.id,
      );
      return new GetCommentResponseDto(
        createdComment,
        user.id,
        anonymousNumber,
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateComment(
    user: AuthorizedUserDto,
    commentId: number,
    requestDto: UpdateCommentRequestDto,
  ): Promise<GetCommentResponseDto> {
    const comment =
      await this.commentRepository.getCommentByCommentId(commentId);
    if (!comment) {
      throw new BadRequestException('Wrong CommentId!');
    }
    if (comment.userId !== user.id) {
      throw new BadRequestException("Other user's comment!");
    }

    const post = await this.postService.isExistingPostId(comment.postId);
    if (Number(post.boardId) === 2) {
      throw new BadRequestException('Cannot update comment in Question Board!');
    }

    const isUpdated = await this.commentRepository.updateComment(
      commentId,
      requestDto.content,
      requestDto.isAnonymous,
    );
    if (!isUpdated) {
      throw new InternalServerErrorException('Comment Update Failed!');
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
    user: AuthorizedUserDto,
    commentId: number,
  ): Promise<DeleteCommentResponseDto> {
    const comment =
      await this.commentRepository.getCommentByCommentIdWithLike(commentId);
    if (!comment) {
      throw new BadRequestException('Wrong commentId!');
    }
    if (comment.userId !== user.id) {
      throw new BadRequestException("Other user's comment!");
    }

    const post = await this.postService.isExistingPostId(comment.postId);
    if (Number(post.boardId) === 2) {
      throw new BadRequestException('Cannot delete comment in Question Board!');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deleteResult = await queryRunner.manager.softRemove(
        CommentEntity,
        comment,
      );
      if (!deleteResult.deletedAt) {
        throw new InternalServerErrorException('Comment Delete Failed!');
      }

      const updateResult = await queryRunner.manager.decrement(
        PostEntity,
        { id: comment.postId },
        'commentCount',
        1,
      );
      if (!updateResult.affected) {
        throw new InternalServerErrorException('Comment Delete Failed!');
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return new DeleteCommentResponseDto(true);
  }

  async likeComment(
    user: AuthorizedUserDto,
    commentId: number,
  ): Promise<LikeCommentResponseDto> {
    if (!(await this.commentRepository.isExistingCommentId(commentId))) {
      throw new BadRequestException('Wrong CommentId!');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const like = await queryRunner.manager.findOne(CommentLikeEntity, {
        where: {
          userId: user.id,
          commentId: commentId,
        },
      });

      if (like) {
        const deleteResult = await queryRunner.manager.delete(
          CommentLikeEntity,
          {
            userId: user.id,
            commentId: commentId,
          },
        );
        if (!deleteResult.affected) {
          throw new InternalServerErrorException('Like Cancel Failed!');
        }

        const updateResult = await queryRunner.manager.decrement(
          CommentEntity,
          { id: commentId },
          'likeCount',
          1,
        );
        if (!updateResult.affected) {
          throw new InternalServerErrorException('Like Cancel Failed!');
        }
      } else {
        const newLike = queryRunner.manager.create(CommentLikeEntity, {
          userId: user.id,
          commentId: commentId,
        });
        await queryRunner.manager.save(newLike);

        const updateResult = await queryRunner.manager.increment(
          CommentEntity,
          { id: commentId },
          'likeCount',
          1,
        );
        if (!updateResult.affected) {
          throw new InternalServerErrorException('Like Failed!');
        }
      }
      await queryRunner.commitTransaction();

      return new LikeCommentResponseDto(!like);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
