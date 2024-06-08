import { ApiProperty } from '@nestjs/swagger';

export class VerifyScreenshotResponseDto {
  constructor(success: boolean) {
    this.success = success;
  }

  @ApiProperty({ description: '정상적으로 처리 되었는지 여부' })
  success: boolean;
}
