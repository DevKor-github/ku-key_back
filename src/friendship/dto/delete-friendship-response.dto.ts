import { ApiProperty } from '@nestjs/swagger';

export class DeleteFriendshipResponseDto {
  constructor(deleted: boolean) {
    this.deleted = deleted;
  }

  @ApiProperty({ description: '삭제 여부' })
  deleted: boolean;
}
