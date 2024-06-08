import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordResponseDto {
  constructor(change: boolean) {
    this.change = change;
  }

  @ApiProperty({ description: '비밀번호 변경 여부' })
  change: boolean;
}
