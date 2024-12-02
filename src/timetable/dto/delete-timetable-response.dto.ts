import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommonDeleteResponseDto } from './common-delete-response.dto';

export class DeleteTimetableResponseDto extends CommonDeleteResponseDto {
  constructor(deleted: boolean, timetableId?: number) {
    super(deleted);
    this.createdTimetableId = timetableId;
  }

  @ApiPropertyOptional({
    description: '시간표 삭제 후 추가로 기본 시간표 생성될 때의 시간표 id',
  })
  createdTimetableId?: number;
}
