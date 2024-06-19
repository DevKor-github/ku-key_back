import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendFriendshipRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '요청 받을 유저의 username' })
  toUsername: string;
}
