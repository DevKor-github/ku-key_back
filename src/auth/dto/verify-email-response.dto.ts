export class VerifyEmailResponseDto {
  constructor(verified: boolean) {
    this.verified = verified;
  }

  verified: boolean;
}
