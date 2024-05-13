import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFriendshipDto {
  @IsNumber()
  @IsNotEmpty()
  fromUserId: number;

  @IsString()
  @IsNotEmpty()
  toUsername: string;
}
