import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFriendshipDto {
  @IsNumber()
  @IsNotEmpty()
  fromUserId: number;

  @IsNumber()
  @IsNotEmpty()
  toUserId: number;
}
