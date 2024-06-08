import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailResponseDto {
  constructor(verified: boolean) {
    this.verified = verified;
  }

  @ApiProperty({ description: '인증 성공 여부' })
  verified: boolean;
}
