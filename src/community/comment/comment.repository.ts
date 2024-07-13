import { Injectable } from '@nestjs/common';
import { CommentEntity } from 'src/entities/comment.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CommentRepository extends Repository<CommentEntity> {
  constructor(dataSource: DataSource) {
    super(CommentEntity, dataSource.createEntityManager());
  }

  async getCommentByCommentId(commentId: number) {
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
      content: content,
      isAnonymous: isAnonymous,
    });
    if (parentCommentId) {
      comment.parentCommentId = parentCommentId;
    }
    return await this.save(comment);
  }

  async updateComment(
    commentId: number,
    content: string,
    isAnonymous: boolean,
  ): Promise<boolean> {
    const result = await this.update(
      { id: commentId },
      {
        content: content,
        isAnonymous: isAnonymous,
      },
    );

    return result.affected ? true : false;
  }

  async deleteComment(commentId: number): Promise<boolean> {
    const deleteResult = await this.softDelete({ id: commentId });
    return deleteResult.affected ? true : false;
  }

  async isExistingCommentId(commentId: number): Promise<boolean> {
    const comment = await this.findOne({ where: { id: commentId } });
    return comment ? true : false;
  }
}
