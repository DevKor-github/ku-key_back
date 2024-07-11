import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUserQueryDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
