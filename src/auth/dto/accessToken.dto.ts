import { IsString } from 'class-validator';

export class AccessTokenDto {
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  @IsString()
  accessToken: string;
}
