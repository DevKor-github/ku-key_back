import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCommentRequestDto } from './dto/create-comment.dto';
import { PostService } from '../post/post.service';
import { GetCommentResponseDto } from './dto/get-comment.dto';
import { UpdateCommentRequestDto } from './dto/update-comment.dto';
import { DeleteCommentResponseDto } from './dto/delete-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService,
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
        await this.commentRepository.getCommentbyCommentId(parentCommentId);
      if (!parentComment) {
        throw new BadRequestException('Wrong ParentCommentId!');
      }
      if (postId !== parentComment.postId) {
        throw new BadRequestException("Cannot create other post's reply!");
      }
      if (parentComment.parentCommentId) {
        parentCommentId = parentComment.parentComment.id;
      }
    }
    const comment = await this.commentRepository.createComment(
      user.id,
      postId,
      requestDto.content,
      requestDto.isAnonymous,
      parentCommentId,
    );
    const createdComment = await this.commentRepository.getCommentbyCommentId(
      comment.id,
    );
    return new GetCommentResponseDto(createdComment, user.id);
  }

  async updateComment(
    user: AuthorizedUserDto,
    commentId: number,
    requestDto: UpdateCommentRequestDto,
  ): Promise<GetCommentResponseDto> {
    const comment =
      await this.commentRepository.getCommentbyCommentId(commentId);
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
      throw new NotImplementedException('Comment Update Failed!');
    }

    const updatedComment =
      await this.commentRepository.getCommentbyCommentId(commentId);
    return new GetCommentResponseDto(updatedComment, user.id);
  }

  async deleteComment(
    user: AuthorizedUserDto,
    commentId: number,
  ): Promise<DeleteCommentResponseDto> {
    const comment =
      await this.commentRepository.getCommentbyCommentId(commentId);
    if (!comment) {
      throw new BadRequestException('Wrong commentId!');
    }
    if (comment.userId !== user.id) {
      throw new BadRequestException("Other user's comment!");
    }

    const isDeleted = await this.commentRepository.deleteComment(commentId);
    if (!isDeleted) {
      throw new NotImplementedException('Comment Delete Failed!');
    }

    return new DeleteCommentResponseDto(true);
  }
}
