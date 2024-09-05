import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CharacterEntity } from 'src/entities/character.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CharacterType } from 'src/enums/character-type.enum';

export class Character {
  @ApiProperty({ description: '캐릭터 종류', enum: CharacterType })
  type: CharacterType;

  @ApiProperty({ description: '캐릭터 레벨' })
  level: number;

  constructor(character: CharacterEntity) {
    this.type = character.type;
    this.level = character.selectLevel ?? character.level;
  }
}

export const Status = {
  Me: 'me',
  Friend: 'friend',
  Requested: 'requested',
  Pending: 'pending',
  Unknown: 'unknown',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export class SearchUserResponseDto {
  @ApiProperty({ description: '본명' })
  name: string;

  @ApiProperty({ description: '친구 추가용 id' })
  username: string;

  @ApiProperty({ description: '출신 학교' })
  homeUniversity: string;

  @ApiProperty({ description: '전공' })
  major: string;

  @ApiProperty({ description: '출신 나라' })
  country: string;

  @IsEnum(Status)
  @ApiProperty({
    description:
      '유저 상태 (본인 / 친구 / 상대방의 수락 대기 중 / 나의 수락 보류 중 / 그 외)',
    enum: Status,
  })
  status: Status;

  @ApiProperty({ description: '유저 캐릭터' })
  character: Character;

  constructor(status: Status, user: UserEntity, character: CharacterEntity) {
    this.status = status;
    this.name = user.name;
    this.username = user.username;
    this.homeUniversity = user.homeUniversity;
    this.major = user.major;
    this.country = user.country;
    this.character = new Character(character);
  }
}
