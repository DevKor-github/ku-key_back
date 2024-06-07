import { ApiProperty } from '@nestjs/swagger';
import { JwtTokenDto } from './jwtToken.dto';

export class LoginResponseDto {
  constructor(token: JwtTokenDto, verified: boolean) {
    this.token = token;
    this.verified = verified;
  }

  @ApiProperty({ description: 'JWT 토큰' })
  token?: JwtTokenDto;

  @ApiProperty({ description: '학교 인증 여부' })
  verified: boolean;
}
