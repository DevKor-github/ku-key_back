import { ApiProperty } from '@nestjs/swagger';

export class DeleteCommentResponseDto {
  constructor(deleted: boolean) {
    this.deleted = deleted;
  }
  @ApiProperty({ description: '댓글 삭제 여부' })
  deleted: boolean;
}
