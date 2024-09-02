import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/entities/user.entity';

export class GetFriendResponseDto {
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

  constructor(friendshipId: number, friend: UserEntity) {
    this.friendshipId = friendshipId;
    this.userId = friend.id;
    this.name = friend.name;
    this.username = friend.username;
    this.major = friend.major;
    this.country = friend.country;
  }
}
