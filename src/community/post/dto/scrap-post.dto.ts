import { ApiProperty } from '@nestjs/swagger';

export class ScrapPostResponseDto {
  constructor(isScrapped: boolean) {
    this.isScrapped = isScrapped;
  }

  @ApiProperty({ description: '스크랩 여부' })
  isScrapped: boolean;
}
