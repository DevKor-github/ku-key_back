import { ApiProperty } from '@nestjs/swagger';

export class GetReceivedFriendshipRequestCountDto {
  @ApiProperty({ description: '전체 받은 친구 요청 개수' })
  totalCount: number;

  @ApiProperty({ description: '확인하지 않은 받은 친구 요청 개수' })
  unreadCount: number;

  constructor(totalCount: number, unreadCount: number) {
    this.totalCount = totalCount;
    this.unreadCount = unreadCount;
  }
}
