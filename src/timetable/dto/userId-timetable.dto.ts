import { ApiProperty } from '@nestjs/swagger';

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
}
