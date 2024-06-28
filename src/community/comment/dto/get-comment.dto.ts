import { ApiProperty } from '@nestjs/swagger';
import { CommentEntity } from 'src/entities/comment.entity';

export class GetCommentResponseDto {
  constructor(commentEntity: CommentEntity, userId: number) {
    this.id = commentEntity.id;
    this.isMyComment = commentEntity.userId === userId;
    this.content = commentEntity.content;
    this.createdAt = commentEntity.createdAt;
    this.updatedAt = commentEntity.updatedAt;
    this.username = commentEntity.isAnonymous
      ? null
      : commentEntity.user.username.substring(
          0,
          Math.floor(commentEntity.user.username.length / 2),
        ) +
        '*'.repeat(
          commentEntity.user.username.length -
            Math.floor(commentEntity.user.username.length / 2),
        );
  }
  @ApiProperty({ description: '댓글 고유 ID' })
  id: number;

  @ApiProperty({ description: '본인이 작성한 댓글인지 여부' })
  isMyComment: boolean;

  @ApiProperty({ description: '댓글 내용' })
  content: string;

  @ApiProperty({ description: '댓글 생성 시간' })
  createdAt: Date;

  @ApiProperty({ description: '댓글 수정 시간' })
  updatedAt: Date;

  @ApiProperty({ description: '댓글을 작성한 사용자(익명이면 null)' })
  username: string | null;
}
