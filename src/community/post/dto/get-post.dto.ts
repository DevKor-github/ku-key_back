import { ApiProperty } from '@nestjs/swagger';
import { GetCommentResponseDto } from 'src/community/comment/dto/get-comment.dto';
import { CommentEntity } from 'src/entities/comment.entity';
import { PostImageEntity } from 'src/entities/post-image.entity';
import { PostEntity } from 'src/entities/post.entity';
import { CommunityUser } from './community-user.dto';
import { Reaction } from './react-post.dto';

class Comment extends GetCommentResponseDto {
  constructor(
    commentEntity: CommentEntity,
    userId: number,
    anonymousNumber: number,
  ) {
    super(commentEntity, userId, anonymousNumber);
    if (!commentEntity.parentCommentId) {
      this.reply = [];
    }
  }

  @ApiProperty({ description: '답글', type: [Comment] })
  reply?: Comment[];
}

class Image {
  constructor(postImageEntity: PostImageEntity) {
    this.id = postImageEntity.id;
    this.imgDir = postImageEntity.imgDir;
  }

  @ApiProperty({ description: '이미지 고유 ID' })
  id: number;

  @ApiProperty({ description: '이미지 경로' })
  imgDir: string;
}

export class ReactionCount {
  constructor(postEntity: PostEntity) {
    this.good = postEntity.goodReactionCount;
    this.sad = postEntity.sadReactionCount;
    this.amazing = postEntity.amazingReactionCount;
    this.angry = postEntity.angryReactionCount;
    this.funny = postEntity.funnyReactionCount;
  }
  @ApiProperty({ description: '좋아요' })
  good: number;

  @ApiProperty({ description: '슬퍼요' })
  sad: number;

  @ApiProperty({ description: '놀라워요' })
  amazing: number;

  @ApiProperty({ description: '화나요' })
  angry: number;

  @ApiProperty({ description: '웃겨요' })
  funny: number;
}

export class GetPostResponseDto {
  constructor(postEntity: PostEntity, userId: number) {
    this.id = postEntity.id;
    this.isMyPost = postEntity.userId === userId;
    this.title = postEntity.title;
    this.content = postEntity.content;
    this.createdAt = postEntity.createdAt;
    this.updatedAt = postEntity.updatedAt;
    this.user = new CommunityUser(postEntity.user, postEntity.isAnonymous);
    this.views = postEntity.views;
    this.scrapCount = postEntity.scrapCount;
    this.myScrap = postEntity.postScraps.some(
      (postScrap) => postScrap.userId === userId,
    );
    this.reactionCount = new ReactionCount(postEntity);
    this.myReaction =
      postEntity.postReactions.find(
        (postReaction) => postReaction.userId === userId,
      )?.reaction || null;

    this.comments = [];
    postEntity.comments
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((comment) => {
        const anonymousNumber = postEntity.commentAnonymousNumbers.filter(
          (commentAnonymousNumber) =>
            commentAnonymousNumber.userId === comment.userId,
        )[0].anonymousNumber;
        if (!comment.parentCommentId) {
          this.comments.push(new Comment(comment, userId, anonymousNumber));
        } else {
          this.comments
            .find(
              (existingComment) =>
                existingComment.id === comment.parentCommentId,
            )
            .reply.push(new Comment(comment, userId, anonymousNumber));
        }
      });

    this.imageDirs = postEntity.postImages
      .filter((postImage) => !postImage.deletedAt)
      .map((postImage) => new Image(postImage));
  }
  @ApiProperty({ description: '게시글 고유 ID' })
  id: number;

  @ApiProperty({ description: '본인이 작성한 글인지 여부' })
  isMyPost: boolean;

  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @ApiProperty({ description: '게시글 생성 시간' })
  createdAt: Date;

  @ApiProperty({ description: '게시글 수정 시간' })
  updatedAt: Date;

  @ApiProperty({ description: '게시글을 생성한 사용자' })
  user: CommunityUser;

  @ApiProperty({ description: '조회수' })
  views: number;

  @ApiProperty({ description: '스크랩 수' })
  scrapCount: number;

  @ApiProperty({ description: '스크랩 여부' })
  myScrap: boolean;

  @ApiProperty({ description: '반응' })
  reactionCount: ReactionCount;

  @ApiProperty({ description: '내 반응(없으면 null)' })
  myReaction: Reaction;

  @ApiProperty({ description: '댓글', type: [Comment] })
  comments: Comment[];

  @ApiProperty({ description: '첨부 이미지 경로', type: [Image] })
  imageDirs: Image[];
}
