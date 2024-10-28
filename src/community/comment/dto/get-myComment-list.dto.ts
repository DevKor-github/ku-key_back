import {
  CursorPageMetaResponseDto,
  CursorPageResponseDto,
} from 'src/common/dto/CursorPageResponse.dto';
import { MyComment } from './get-comment.dto';
import { CommentEntity } from 'src/entities/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class GetMyCommentListResponseDto extends CursorPageResponseDto<MyComment> {
  @ApiProperty({ type: [MyComment], description: '댓글 목록' })
  data: MyComment[];

  constructor(
    commentEntities: CommentEntity[],
    meta: CursorPageMetaResponseDto,
  ) {
    super(meta);
    this.data = commentEntities.map(
      (commentEntity) => new MyComment(commentEntity),
    );
  }
}
