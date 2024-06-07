import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  constructor(logout: boolean) {
    this.logout = logout;
  }

  @ApiProperty({ description: '로그아웃 성공 여부' })
  logout: boolean;
}
