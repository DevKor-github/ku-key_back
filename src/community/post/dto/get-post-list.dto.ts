import { PostEntity } from 'src/entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CursorPageOptionsDto } from 'src/common/dto/CursorPageOptions.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CursorPageResponseDto } from 'src/common/dto/CursorPageResponse.dto';
import { PostPreviewWithBoardName } from './post-preview.dto';

export class GetPostListResponseDto extends CursorPageResponseDto<PostPreviewWithBoardName> {
  constructor(postEntities: PostEntity[], userId: number) {
    super();
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
