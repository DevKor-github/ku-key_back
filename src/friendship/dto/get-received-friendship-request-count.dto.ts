import { ApiProperty } from '@nestjs/swagger';
import { FriendCharacterDto } from './friend-character.dto';
import { CharacterEntity } from 'src/entities/character.entity';

export class GetReceivedFriendshipRequestCountDto {
  @ApiProperty({ description: '전체 받은 친구 요청 개수' })
  totalCount: number;

  @ApiProperty({ description: '확인하지 않은 받은 친구 요청 개수' })
  unreadCount: number;

  @ApiProperty({
    description: '가장 최근에 요청을 보낸 친구의 캐릭터 (최대 2개)',
  })
  friendCharacters: FriendCharacterDto[];

  constructor(
    totalCount: number,
    unreadCount: number,
    friendChararcters: CharacterEntity[],
  ) {
    this.totalCount = totalCount;
    this.unreadCount = unreadCount;
    this.friendCharacters = friendChararcters.map((character) => {
      return new FriendCharacterDto(character);
    });
  }
}
