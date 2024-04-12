import { IsString } from 'class-validator';

export class JwtTokenDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
