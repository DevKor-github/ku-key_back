export class CreateUserResponseDto {
  constructor(created: boolean) {
    this.created = created;
  }

  created: boolean;
}
