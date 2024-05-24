import { IsNotEmpty, IsString } from 'class-validator';

export class SendFriendshipRequestDto {
  @IsNotEmpty()
  @IsString()
  toUsername: string;
}
