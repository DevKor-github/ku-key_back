import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { BoardEntity } from 'src/entities/board.entity';
import { PostEntity } from 'src/entities/post.entity';
import { CursorPageOptionsDto } from 'src/common/dto/CursorPageOptions.dto';
import { CursorPageResponseDto } from 'src/common/dto/CursorPageResponse.dto';
import { PostPreview } from './post-preview.dto';

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

export class GetPostListWithBoardResponseDto extends CursorPageResponseDto<PostPreview> {
  constructor(boardEntity: BoardEntity, postEntities: PostEntity[]) {
    super();
    this.board = new BoardInfo(boardEntity);
    this.data = postEntities.map((postEntity) => new PostPreview(postEntity));
  }

  @ApiProperty({ description: '게시판 정보' })
  board: BoardInfo;
}

export class GetPostListWithBoardRequestDto extends CursorPageOptionsDto {
  @ApiProperty({
    description: '게시판 고유 Id, 1: 자유게시판, 2: 질문게시판, 3: 정보게시판',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(3)
  boardId: number;

  @ApiProperty({ description: '검색어, 없으면 전체 조회' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  keyword?: string;
}
