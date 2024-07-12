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
import { DataSource } from 'typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { PostEntity } from 'src/entities/post.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService,
    private readonly dataSource: DataSource,
  ) {}

  async createComment(
    user: AuthorizedUserDto,
    postId: number,
    requestDto: CreateCommentRequestDto,
    parentCommentId?: number,
  ) {
    if (!(await this.postService.isExistingPostId(postId))) {
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

      await queryRunner.commitTransaction();

      const createdComment = await this.commentRepository.getCommentByCommentId(
        createResult.id,
      );
      return new GetCommentResponseDto(createdComment, user.id);
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
    return new GetCommentResponseDto(updatedComment, user.id);
  }

  async deleteComment(
    user: AuthorizedUserDto,
    commentId: number,
  ): Promise<DeleteCommentResponseDto> {
    const comment =
      await this.commentRepository.getCommentByCommentId(commentId);
    if (!comment) {
      throw new BadRequestException('Wrong commentId!');
    }
    if (comment.userId !== user.id) {
      throw new BadRequestException("Other user's comment!");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deleteResult = await queryRunner.manager.softDelete(CommentEntity, {
        id: commentId,
      });
      if (!deleteResult.affected) {
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
}
