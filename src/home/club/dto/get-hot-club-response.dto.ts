import { ApiProperty, PickType } from '@nestjs/swagger';
import { GetClubResponseDto } from './get-club-response.dto';

export class GetHotClubResponseDto extends PickType(GetClubResponseDto, [
  'name',
  'summary',
  'imageUrl',
] as const) {
  @ApiProperty({ description: '동아리 카테고리' })
  category: string;

  @ApiProperty({ description: '동아리 순위' })
  ranking: number;
}
