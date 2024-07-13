import { ApiProperty } from '@nestjs/swagger';

export class UpdateCalendarDataResponseDto {
  constructor(updated: boolean) {
    this.updated = updated;
  }

  @ApiProperty({ description: '업데이트 여부' })
  updated: boolean;
}
