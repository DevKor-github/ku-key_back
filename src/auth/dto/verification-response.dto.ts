import { ApiProperty } from '@nestjs/swagger';

export class VerificationResponseDto {
  constructor(sended: boolean) {
    this.sended = sended;
  }

  @ApiProperty({ description: '이매일 발송 여부' })
  sended: boolean;
}
