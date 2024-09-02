import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/entities/user.entity';
import { CharacterType } from 'src/enums/character-type.enum';

export class GetWaitingFriendResponseDto {
  @ApiProperty({ description: 'freindship table의 PK' })
  friendshipId: number;

  @ApiProperty({ description: 'user table의 PK' })
  userId: number;

  @ApiProperty({ description: '본명' })
  name: string;

  @ApiProperty({ description: '친구 추가용 아이디' })
  username: string;

  @ApiProperty({ description: '전공' })
  major: string;

  @ApiProperty({ description: '출신 나라' })
  country: string;

  @ApiProperty({ description: '캐릭터 레벨' })
  level: number;

  @ApiProperty({ description: '캐릭터 타입' })
  type: CharacterType;

  constructor(friendshipId: number, friend: UserEntity) {
    this.friendshipId = friendshipId;
    this.userId = friend.id;
    this.name = friend.name;
    this.username = friend.username;
    this.major = friend.major;
    this.country = friend.country;
    this.level = friend.character.level;
    this.type = friend.character.type;
  }
}
