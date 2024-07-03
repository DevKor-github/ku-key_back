import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JwtTokenDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  @ApiProperty({ description: 'Access Token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token' })
  @IsString()
  refreshToken: string;
}
