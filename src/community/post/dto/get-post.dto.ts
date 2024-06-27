import { ApiProperty } from '@nestjs/swagger';
import { PostImageEntity } from 'src/entities/post-image.entity';
import { PostEntity } from 'src/entities/post.entity';

class Comment {
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

  @ApiProperty({ description: '답글', type: [Comment] })
  reply: Comment[];
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

export class GetPostResponseDto {
  constructor(postEntity: PostEntity, userId: number) {
    this.id = postEntity.id;
    this.isMyPost = postEntity.userId === userId;
    this.title = postEntity.title;
    this.content = postEntity.content;
    this.createdAt = postEntity.createdAt;
    this.updatedAt = postEntity.updatedAt;
    this.username = postEntity.isAnonymous
      ? null
      : postEntity.user.username.substring(
          0,
          Math.floor(postEntity.user.username.length / 2),
        ) +
        '*'.repeat(
          postEntity.user.username.length -
            Math.floor(postEntity.user.username.length / 2),
        );

    //댓글 할당 코드 필요

    this.imageDirs = postEntity.postImages.map(
      (postImage) => new Image(postImage),
    );
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

  @ApiProperty({ description: '게시글을 생성한 사용자(익명이면 null)' })
  username: string | null;

  @ApiProperty({ description: '댓글', type: [Comment] })
  comments: Comment[];

  @ApiProperty({ description: '첨부 이미지 경로', type: [Image] })
  imageDirs: Image[];
}
