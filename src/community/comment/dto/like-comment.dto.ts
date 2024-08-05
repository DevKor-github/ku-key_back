import { ApiProperty } from '@nestjs/swagger';

export class LikeCommentResponseDto {
  constructor(isLiked: boolean) {
    this.isLiked = isLiked;
  }

  @ApiProperty({ description: '좋아요 여부' })
  isLiked: boolean;
}
