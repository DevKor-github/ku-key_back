import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { BoardEntity } from 'src/entities/board.entity';
import { PostEntity } from 'src/entities/post.entity';

class BoardInfo {
  constructor(boardEntity: BoardEntity) {
    this.id = boardEntity.id;
    this.name = boardEntity.name;
    this.description = boardEntity.description;
  }

  @ApiProperty({ description: '게시판 고유 ID' })
  id: number;

  @ApiProperty({ description: '게시판 이름' })
  name: string;

  @ApiProperty({ description: '게시판 설명' })
  description: string;
}

class PostPreview {
  constructor(postEntity: PostEntity) {
    this.id = postEntity.id;
    this.title = postEntity.title;
    this.content = postEntity.content.substring(0, 100);
    this.createdAt = postEntity.createdAt;
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
    this.commentNumber = postEntity.comments.length;
    this.thumbnailDir =
      postEntity.postImages.length > 0 ? postEntity.postImages[0].imgDir : null;
  }

  @ApiProperty({ description: '게시글 고유 ID' })
  id: number;

  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용(100글자 까지)' })
  content: string;

  @ApiProperty({ description: '게시글 생성 시간' })
  createdAt: Date;

  @ApiProperty({ description: '게시글을 생성한 사용자(익명이면 null)' })
  username: string | null;

  @ApiProperty({ description: '댓글 수' })
  commentNumber: number;

  @ApiProperty({ description: '사진 미리보기(사진이 없으면 null)' })
  thumbnailDir: string | null;
}

export class GetPostListResponseDto {
  constructor(boardEntity: BoardEntity, postEntities: PostEntity[]) {
    this.board = new BoardInfo(boardEntity);
    this.posts = postEntities
      .map((postEntity) => new PostPreview(postEntity))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  @ApiProperty({ description: '게시판 정보' })
  board: BoardInfo;

  @ApiProperty({ description: '게시글 목록', type: [PostPreview] })
  posts: PostPreview[];
}

export class GetPostListRequestDto {
  @IsNotEmpty()
  @IsNumber()
  boardId: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  keyword?: string;
}
