import { ApiProperty } from '@nestjs/swagger';

export class GetBannerImageUrlResponseDto {
  @ApiProperty({ description: 'S3에 저장된 배너 이미지 url' })
  imageUrl: string;

  constructor(imageUrl: string) {
    this.imageUrl = imageUrl;
  }
}
