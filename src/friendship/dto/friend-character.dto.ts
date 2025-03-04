import { ApiProperty } from '@nestjs/swagger';
import { CharacterEntity } from 'src/entities/character.entity';
import { CharacterType } from 'src/enums/character-type.enum';

export class FriendCharacterDto {
  @ApiProperty({ description: '캐릭터 종류', enum: CharacterType })
  type: CharacterType;

  @ApiProperty({ description: '캐릭터 레벨' })
  level: number;

  constructor(character: CharacterEntity) {
    this.type = character.type;
    this.level = character.selectedLevel ?? character.level;
  }
}
