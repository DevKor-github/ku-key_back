import { CursorPageResponseDto } from 'src/common/dto/CursorPageResponse.dto';
import { MyComment } from './get-comment.dto';
import { CommentEntity } from 'src/entities/comment.entity';

export class GetMyCommentListResponseDto extends CursorPageResponseDto<MyComment> {
  constructor(commentEntities: CommentEntity[]) {
    super();
    this.data = commentEntities.map(
      (commentEntity) => new MyComment(commentEntity),
    );
  }
}
