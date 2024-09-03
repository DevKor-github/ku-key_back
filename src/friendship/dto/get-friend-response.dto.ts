import { ApiProperty } from '@nestjs/swagger';
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
    this.level = character.level;
  }
}

export class GetFriendResponseDto {
  @ApiProperty({ description: 'freindship table의 PK' })
  friendshipId: number;

  @ApiProperty({ description: 'user table의 PK' })
  userId: number;

  @ApiProperty({ description: '본명' })
  name: string;

  @ApiProperty({ description: '친구 추가용 아이디' })
  username: string;

  @ApiProperty({ description: '출신 학교' })
  homeUniversity: string;

  @ApiProperty({ description: '전공' })
  major: string;

  @ApiProperty({ description: '출신 나라' })
  country: string;

  @ApiProperty({ description: '유저 캐릭터' })
  character: Character;

  constructor(friendshipId: number, friend: UserEntity) {
    this.friendshipId = friendshipId;
    this.userId = friend.id;
    this.name = friend.name;
    this.username = friend.username;
    this.homeUniversity = friend.homeUniversity;
    this.major = friend.major;
    this.country = friend.country;
    this.character = friend.character;
  }
}
