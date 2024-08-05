import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { BoardEntity } from 'src/entities/board.entity';
import { PostEntity } from 'src/entities/post.entity';
import { ReactionCount } from './get-post.dto';

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

export class PostPreview {
  constructor(postEntity: PostEntity) {
    this.id = postEntity.id;
    this.title = postEntity.title;
    this.content = postEntity.content.substring(0, 100);
    this.createdAt = postEntity.createdAt;
    console.log(postEntity);
    this.username =
      postEntity.user == null || postEntity.user.deletedAt
        ? 'Deleted'
        : postEntity.isAnonymous
          ? 'Anonymous'
          : postEntity.user.username.substring(
              0,
              Math.floor(postEntity.user.username.length / 2),
            ) +
            '*'.repeat(
              postEntity.user.username.length -
                Math.floor(postEntity.user.username.length / 2),
            );
    this.commentCount = postEntity.commentCount;
    this.scrapCount = postEntity.scrapCount;
    this.thumbnailDir =
      postEntity.postImages.length > 0 ? postEntity.postImages[0].imgDir : null;
    this.reaction = new ReactionCount();
    this.reaction.good = postEntity.goodReactionCount;
    this.reaction.sad = postEntity.sadReactionCount;
    this.reaction.amazing = postEntity.amazingReactionCount;
    this.reaction.angry = postEntity.angryReactionCount;
    this.reaction.funny = postEntity.funnyReactionCount;
  }

  @ApiProperty({ description: '게시글 고유 ID' })
  id: number;

  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용(100글자 까지)' })
  content: string;

  @ApiProperty({ description: '게시글 생성 시간' })
  createdAt: Date;

  @ApiProperty({ description: '게시글을 생성한 사용자' })
  username: string;

  @ApiProperty({ description: '댓글 수' })
  commentCount: number;

  @ApiProperty({ description: '스크랩 수' })
  scrapCount: number;

  @ApiProperty({ description: '사진 미리보기(사진이 없으면 null)' })
  thumbnailDir: string | null;

  @ApiProperty({ description: '반응' })
  reaction: ReactionCount;
}

export class GetPostListWithBoardResponseDto {
  constructor(boardEntity: BoardEntity, postEntities: PostEntity[]) {
    this.board = new BoardInfo(boardEntity);
    this.posts = postEntities.map((postEntity) => new PostPreview(postEntity));
  }

  @ApiProperty({ description: '게시판 정보' })
  board: BoardInfo;

  @ApiProperty({ description: '게시글 목록', type: [PostPreview] })
  posts: PostPreview[];
}

export class GetPostListWithBoardRequestDto {
  @IsNotEmpty()
  @IsNumber()
  boardId: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  keyword?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  pageSize: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  pageNumber: number;
}
