import { ApiProperty } from '@nestjs/swagger';
import { JwtTokenDto } from './jwtToken.dto';

export class LoginResponseDto {
  constructor(token: JwtTokenDto, verified: boolean, deviceCode: string) {
    this.token = token;
    this.verified = verified;
    this.deviceCode = deviceCode;
  }

  @ApiProperty({ description: 'JWT 토큰' })
  token?: JwtTokenDto;

  @ApiProperty({ description: '학교 인증 여부' })
  verified: boolean;

  @ApiProperty({ description: '기기 코드' })
  deviceCode: string;
}
