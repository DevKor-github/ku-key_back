import { ApiProperty } from '@nestjs/swagger';
import { CharacterEntity } from 'src/entities/character.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CharacterType } from 'src/enums/character-type.enum';

export class Character {
  constructor(characterEntity: CharacterEntity) {
    this.type = characterEntity.type;
    this.level = characterEntity.selectedLevel ?? characterEntity.level;
  }

  @ApiProperty({ description: '캐릭터 종류', enum: CharacterType })
  type: CharacterType;

  @ApiProperty({ description: '캐릭터 레벨' })
  level: number;
}

export class CommunityUser {
  constructor(
    user: UserEntity,
    isAnonymous: boolean,
    anonymousNumber?: number,
  ) {
    if (user == null || user.deletedAt) {
      this.username = 'Deleted';
      this.isDeleted = true;
      this.character = { type: CharacterType.deleted, level: null };
    } else {
      if (!isAnonymous) {
        this.username =
          user.username.substring(0, Math.floor(user.username.length / 2)) +
          '*'.repeat(
            user.username.length - Math.floor(user.username.length / 2),
          );
        this.character = new Character(user.character);
      } else {
        if (anonymousNumber === 0) this.username = 'Author';
        else if (!anonymousNumber) this.username = 'Anonymous';
        else this.username = `Anonymous ${anonymousNumber}`;
        this.isAnonymous = true;
        this.character = { type: CharacterType.anonymous, level: null };
      }
    }
  }
  @ApiProperty({
    description: '사용자, 익명이면 "Anonymous", 탈퇴했으면 "Deleted"',
  })
  username: string;

  @ApiProperty({ description: '사용자가 익명인지' })
  isAnonymous: boolean = false;

  @ApiProperty({ description: '사용자가 탈퇴된 유저인지' })
  isDeleted: boolean = false;

  @ApiProperty({ description: '사용자 캐릭터', type: Character })
  character: Character;
}
