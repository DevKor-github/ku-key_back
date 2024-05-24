export class RejectFriendshipResponseDto {
  constructor(rejected: boolean) {
    this.rejected = rejected;
  }

  rejected: boolean;
}
