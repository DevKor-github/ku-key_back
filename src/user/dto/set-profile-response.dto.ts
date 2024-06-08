import { ApiProperty } from '@nestjs/swagger';

export class SetProfileResponseDto {
  constructor(set: boolean) {
    this.set = set;
  }

  @ApiProperty({ description: '프로필 설정 성공 여부' })
  set: boolean;
}
