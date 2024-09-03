import { ApiProperty } from '@nestjs/swagger';

export class SendFriendshipResponseDto {
  @ApiProperty({ description: '요청 성공 여부' })
  sent: boolean;

  constructor(sent: boolean) {
    this.sent = sent;
  }
}
