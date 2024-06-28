import { BadRequestException, Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCommentRequestDto } from './dto/create-comment.dto';
import { PostService } from '../post/post.service';
import { GetCommentResponseDto } from './dto/get-comment.dto';

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
}
