import { ApiProperty, PickType } from '@nestjs/swagger';
import { CommunityUser } from 'src/community/post/dto/community-user.dto';
import { CommentEntity } from 'src/entities/comment.entity';

export class GetCommentResponseDto {
  constructor(
    commentEntity: CommentEntity,
    userId: number,
    anonymousNumber?: number,
  ) {
    this.id = commentEntity.id;
    this.isDeleted = commentEntity.deletedAt ? true : false;
    this.createdAt = commentEntity.createdAt;
    this.updatedAt = commentEntity.updatedAt;
    if (this.isDeleted) {
      this.isMyComment = false;
      this.content = null;
      this.user = {
        username: null,
        isAnonymous: false,
        isDeleted: false,
        character: { type: null, level: null },
      };
      this.likeCount = null;
      this.myLike = false;
    } else {
      this.isMyComment = commentEntity.userId === userId;
      this.content = commentEntity.content;
      this.user = new CommunityUser(
        commentEntity.user,
        commentEntity.isAnonymous,
        anonymousNumber,
      );
      this.likeCount = commentEntity.likeCount;
      this.myLike = commentEntity.commentLikes.some(
        (commentLike) => commentLike.userId === userId,
      );
    }
  }
  @ApiProperty({ description: '댓글 고유 ID' })
  id: number;

  @ApiProperty({ description: '삭제된 댓글인지 여부' })
  isDeleted: boolean;

  @ApiProperty({ description: '댓글 생성 시간' })
  createdAt: Date;

  @ApiProperty({ description: '댓글 수정 시간' })
  updatedAt?: Date;

  @ApiProperty({ description: '본인이 작성한 댓글인지 여부' })
  isMyComment?: boolean;

  @ApiProperty({ description: '댓글 내용' })
  content?: string;

  @ApiProperty({ description: '댓글을 작성한 사용자' })
  user: CommunityUser;

  @ApiProperty({ description: '좋아요 수' })
  likeCount?: number;

  @ApiProperty({ description: '좋아요 눌렀는지 여부' })
  myLike: boolean;
}

export class MyComment extends PickType(GetCommentResponseDto, [
  'id',
  'createdAt',
  'updatedAt',
  'content',
  'likeCount',
]) {
  constructor(commentEntity: CommentEntity) {
    super();
    this.id = commentEntity.id;
    this.createdAt = commentEntity.createdAt;
    this.updatedAt = commentEntity.updatedAt;
    this.content = commentEntity.content;
    this.likeCount = commentEntity.likeCount;
    this.postId = commentEntity.postId;
    this.replyCount = commentEntity.replyComments.length;
    this.isAnonymous = commentEntity.isAnonymous;
  }

  @ApiProperty({ description: '댓글을 작성한 게시글 Id' })
  postId: number;

  @ApiProperty({ description: '답글 수' })
  replyCount: number;

  @ApiProperty({ description: '익명 설정 여부' })
  isAnonymous: boolean;
}
