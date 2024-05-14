import { JwtTokenDto } from './jwtToken.dto';

export class LoginResponseDto {
  constructor(token: JwtTokenDto, verified: boolean) {
    this.token = token;
    this.verified = verified;
  }

  token?: JwtTokenDto;
  verified: boolean;
}
