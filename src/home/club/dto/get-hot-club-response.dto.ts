import { ApiProperty, PickType } from '@nestjs/swagger';
import { GetClubResponseDto } from './get-club-response.dto';
import { ClubEntity } from 'src/entities/club.entity';

export class GetHotClubResponseDto extends PickType(GetClubResponseDto, [
  'clubId',
  'name',
  'summary',
  'imageUrl',
]) {
  @ApiProperty({ description: '동아리 카테고리' })
  category: string;

  @ApiProperty({ description: '동아리 순위' })
  ranking: number;

  constructor(club: ClubEntity, ranking: number) {
    super();
    this.clubId = club.id;
    this.name = club.name;
    this.summary = club.summary;
    this.imageUrl = club.imageUrl;
    this.category = club.category;
    this.ranking = ranking;
  }
}
