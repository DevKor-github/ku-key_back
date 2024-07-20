import { ApiProperty } from '@nestjs/swagger';

export class DeleteCalendarDataResponseDto {
  @ApiProperty({ description: '행사/일정 삭제 여부' })
  deleted: boolean;

  constructor(deleted: boolean) {
    this.deleted = deleted;
  }
}
