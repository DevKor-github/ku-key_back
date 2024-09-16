import { ApiProperty } from '@nestjs/swagger';

export class SelectCharacterLevelResponseDto {
  @ApiProperty({ description: '선택된 캐릭터 레벨' })
  selectedLevel: number;

  constructor(selectedLevel: number) {
    this.selectedLevel = selectedLevel;
  }
}
