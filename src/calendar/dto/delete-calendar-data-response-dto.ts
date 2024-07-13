import { ApiProperty } from '@nestjs/swagger';

export class DeleteCalendarDataResponseDto {
  constructor(deleted: boolean) {
    this.deleted = deleted;
  }

  @ApiProperty({ description: '행사/일정 삭제 여부' })
  deleted: boolean;
}
