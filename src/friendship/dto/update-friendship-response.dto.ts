import { ApiProperty } from '@nestjs/swagger';

export class UpdateFriendshipResponseDto {
  constructor(updated: boolean) {
    this.updated = updated;
  }

  @ApiProperty({ description: '업데이트 성공 여부' })
  updated: boolean;
}
