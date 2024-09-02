import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUserRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
