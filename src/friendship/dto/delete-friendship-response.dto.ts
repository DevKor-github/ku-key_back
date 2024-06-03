export class DeleteFriendshipResponseDto {
  constructor(deleted: boolean) {
    this.deleted = deleted;
  }

  deleted: boolean;
}
