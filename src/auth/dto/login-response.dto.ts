import { ApiProperty } from '@nestjs/swagger';
import { JwtTokenDto } from './jwtToken.dto';

export class LoginResponseDto {
  constructor(
    token: JwtTokenDto,
    verified: boolean,
    deviceCode: string,
    userId: number,
  ) {
    this.token = token;
    this.verified = verified;
    this.deviceCode = deviceCode;
    this.userId = userId;
  }

  @ApiProperty({ description: 'JWT 토큰' })
  token?: JwtTokenDto;

  @ApiProperty({ description: '학교 인증 여부' })
  verified: boolean;

  @ApiProperty({ description: '기기 코드' })
  deviceCode: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: number;
}
