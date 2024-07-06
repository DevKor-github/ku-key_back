import { ApiProperty } from '@nestjs/swagger';

export class DeletePostResponseDto {
  constructor(deleted: boolean) {
    this.deleted = deleted;
  }
  @ApiProperty({ description: '게시글 삭제 여부' })
  deleted: boolean;
}
