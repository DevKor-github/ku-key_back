import { ApiProperty } from '@nestjs/swagger';

export class DeleteClubResponseDto {
  @ApiProperty({ description: '삭제 여부' })
  deleted: boolean;

  constructor(deleted: boolean) {
    this.deleted = deleted;
  }
}
