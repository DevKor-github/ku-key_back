import { PostEntity } from 'src/entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CursorPageOptionsDto } from 'src/common/dto/CursorPageOptions.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
import {
  CursorPageMetaResponseDto,
  CursorPageResponseDto,
} from 'src/common/dto/CursorPageResponse.dto';
import { PostPreviewWithBoardName } from './post-preview.dto';

export class GetPostListResponseDto extends CursorPageResponseDto<PostPreviewWithBoardName> {
  @ApiProperty({ type: [PostPreviewWithBoardName], description: '게시글 목록' })
  data: PostPreviewWithBoardName[];

  constructor(
    postEntities: PostEntity[],
    userId: number,
    meta: CursorPageMetaResponseDto,
  ) {
    super(meta);
    this.data = postEntities.map(
      (postEntity) => new PostPreviewWithBoardName(postEntity, userId),
    );
  }
}

export class GetPostListRequestDto extends CursorPageOptionsDto {}

export class getAllPostListRequestDto extends CursorPageOptionsDto {
  @ApiProperty({ description: '검색어, 없으면 전체 조회', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  keyword?: string;
}
