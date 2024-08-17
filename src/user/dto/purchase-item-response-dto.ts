import { ApiPropertyOptional } from '@nestjs/swagger';
import { CharacterType } from 'src/enums/character-type.enum';

export class PurchaseItemResponseDto {
  @ApiPropertyOptional({
    description: '업데이트된 열람 가능 기간 (강의평 열람권 구매 시)',
  })
  viewableUntil?: Date;

  @ApiPropertyOptional({ description: '업그레이드 레벨 (캐릭터 진화 구매 시)' })
  upgradeLevel?: number;

  @ApiPropertyOptional({
    description: '변경된 캐릭터 타입 (캐릭터 타입 변경 구매 시)',
  })
  newCharacterType?: CharacterType;
}
