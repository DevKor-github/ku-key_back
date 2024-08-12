import { ApiProperty } from '@nestjs/swagger';
import { CharacterType } from 'src/enums/character-type.enum';

export class PurchaseItemResponseDto {
  @ApiProperty({ description: '업데이트된 열람 가능 기간' })
  viewableUntil?: Date;

  @ApiProperty({ description: '업그레이드 레벨' })
  upgradeLevel?: number;

  @ApiProperty({ description: '변경된 캐릭터 타입' })
  newCharacterType?: CharacterType;
}
