import { Injectable } from '@nestjs/common';
import { CommentEntity } from 'src/entities/comment.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CommentRepository extends Repository<CommentEntity> {
  constructor(dataSource: DataSource) {
    super(CommentEntity, dataSource.createEntityManager());
  }

  async getCommentbyCommentId(commentId: number) {
    const comment = await this.findOne({
      where: { id: commentId },
      relations: ['parentComment', 'user'],
    });

    return comment;
  }

  async createComment(
    userId: number,
    postId: number,
    content: string,
    isAnonymous: boolean,
    parentCommentId?: number,
  ): Promise<CommentEntity> {
    const comment = this.create({
      userId: userId,
      postId: postId,
      conetnt: content,
      isAnonymous: isAnonymous,
    });
    if (parentCommentId) {
      comment.parentCommentId = parentCommentId;
    }
    return await this.save(comment);
  }
}
