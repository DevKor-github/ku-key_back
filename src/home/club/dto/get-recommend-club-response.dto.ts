import { ApiProperty, PickType } from '@nestjs/swagger';
import { GetClubResponseDto } from './get-club-response.dto';

export class GetRecommendClubResponseDto extends PickType(GetClubResponseDto, [
  'name',
  'summary',
  'imageUrl',
]) {
  @ApiProperty({ description: '동아리 카테고리' })
  category: string;
}
