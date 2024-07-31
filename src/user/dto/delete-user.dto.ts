import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponseDto {
  constructor(deleted: boolean) {
    this.deleted = deleted;
  }

  @ApiProperty({ description: '회원 탈퇴 성공 여부' })
  deleted: boolean;
}
