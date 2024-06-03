import { ApiProperty } from '@nestjs/swagger';

export class SendFriendshipResponseDto {
  constructor(sent: boolean) {
    this.sent = sent;
  }

  @ApiProperty({ description: '요청 성공 여부' })
  sent: boolean;
}
