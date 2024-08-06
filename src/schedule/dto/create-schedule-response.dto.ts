import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '시간표 ID' })
  timetableId: number;

  @ApiProperty({ description: '일정 이름' })
  title: string;

  @ApiProperty({ description: '요일' })
  day: string;

  @ApiProperty({ description: '시작 시간' })
  startTime: string;

  @ApiProperty({ description: '종료 시간' })
  endTime: string;

  @ApiProperty({ description: '장소' })
  location: string;
}
