import { ApiProperty } from '@nestjs/swagger';
import { GetTimetableByTimetableIdDto } from 'src/timetable/dto/get-timetable-timetable.dto';

export class GetFriendTimetableResponseDto {
  @ApiProperty({
    description: '친구 시간표 정보',
    type: GetTimetableByTimetableIdDto,
    nullable: true,
  })
  timetable: GetTimetableByTimetableIdDto | null;

  constructor(timetable: GetTimetableByTimetableIdDto | null) {
    this.timetable = timetable;
  }
}
