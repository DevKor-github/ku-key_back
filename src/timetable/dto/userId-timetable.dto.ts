import { ApiProperty } from '@nestjs/swagger';
import { TimetableEntity } from 'src/entities/timetable.entity';

export class GetTimetableByUserIdResponseDto {
  @ApiProperty({ description: '시간표 ID' })
  timetableId: number;

  @ApiProperty({ description: '학기' })
  semester: string;

  @ApiProperty({ description: '연도' })
  year: string;

  @ApiProperty({ description: '대표 시간표 여부' })
  mainTimetable: boolean;

  @ApiProperty({ description: '시간표 이름' })
  timetableName: string;

  @ApiProperty({ description: '시간표 색상' })
  color: string;

  constructor(timetableEntity: TimetableEntity) {
    this.timetableId = timetableEntity.id;
    this.semester = timetableEntity.semester;
    this.year = timetableEntity.year;
    this.mainTimetable = timetableEntity.mainTimetable;
    this.timetableName = timetableEntity.timetableName;
    this.color = timetableEntity.color;
  }
}
