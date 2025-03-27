import { ApiProperty } from '@nestjs/swagger';
import { GetTimetableByTimetableIdDto } from './get-timetable-timetable.dto';

export class GetNullableTimetableResponseDto {
  @ApiProperty({
    description: '특정 시간표 정보',
    type: GetTimetableByTimetableIdDto,
    nullable: true,
  })
  timetable: GetTimetableByTimetableIdDto | null;

  constructor(timetable: GetTimetableByTimetableIdDto | null) {
    this.timetable = timetable;
  }
}
