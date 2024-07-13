import { PostEntity } from 'src/entities/post.entity';
import {
  GetPostListWithBoardRequestDto,
  PostPreview,
} from './get-post-list-with-board.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';

class PostPreviewWithBoardName extends PostPreview {
  constructor(postEntity: PostEntity) {
    super(postEntity);
    this.boardName = postEntity.board.name;
  }

  @ApiProperty({ description: '게시판 이름' })
  boardName: string;
}

export class GetPostListResponseDto {
  constructor(postEntities: PostEntity[]) {
    this.posts = postEntities.map(
      (postEntity) => new PostPreviewWithBoardName(postEntity),
    );
  }
  @ApiProperty({ description: '게시글 목록', type: [PostPreviewWithBoardName] })
  posts: PostPreviewWithBoardName[];
}

export class GetPostListRequestDto extends PickType(
  GetPostListWithBoardRequestDto,
  ['pageSize', 'pageNumber'],
) {}
