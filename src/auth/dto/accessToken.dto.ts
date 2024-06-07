import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AccessTokenDto {
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  @ApiProperty({ description: 'Access Token' })
  @IsString()
  accessToken: string;
}
