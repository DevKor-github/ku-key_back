import { ApiProperty } from '@nestjs/swagger';

export class DeleteInstitutionResponseDto {
  @ApiProperty({ description: '삭제 여부' })
  deleted: boolean;

  constructor(deleted: boolean) {
    this.deleted = deleted;
  }
}
