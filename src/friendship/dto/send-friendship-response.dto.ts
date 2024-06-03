export class SendFriendshipResponseDto {
  constructor(sent: boolean) {
    this.sent = sent;
  }

  sent: boolean;
}
