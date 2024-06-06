import { ApiProperty } from '@nestjs/swagger';

export class LikeClubResponseDto {
  constructor(liked: boolean) {
    this.liked = liked;
  }

  @ApiProperty({ description: '찜 여부' })
  liked: boolean;
}
