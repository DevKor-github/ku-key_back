import { ApiProperty } from '@nestjs/swagger';

export class SetResponseDto {
  constructor(set: boolean) {
    this.set = set;
  }

  @ApiProperty({ description: '설정 성공 여부' })
  set: boolean;
}
