import { ApiProperty } from '@nestjs/swagger';

export class RejectFriendshipResponseDto {
  constructor(rejected: boolean) {
    this.rejected = rejected;
  }

  @ApiProperty({ description: '거절 여부' })
  rejected: boolean;
}
