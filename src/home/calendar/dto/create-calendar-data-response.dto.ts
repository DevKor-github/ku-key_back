import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from 'src/entities/calendar.entity';

export class CreateCalendarDataResponseDto {
  @ApiProperty({ description: '행사/일정 id' })
  id: number;

  @ApiProperty({ description: '시작 날짜 (AAAA-BB-CC 형식)' })
  startDate: Date;

  @ApiProperty({ description: '종료 날짜 (AAAA-BB-CC 형식)' })
  endDate: Date;

  @ApiProperty({ description: '행사/일정 제목' })
  title: string;

  @ApiProperty({ description: '행사/일정 설명' })
  description: string;

  @ApiProperty({ description: '학사 일정 여부' })
  isAcademic: boolean;

  constructor(calendar: CalendarEntity) {
    this.id = calendar.id;
    this.startDate = calendar.startDate;
    this.endDate = calendar.endDate;
    this.title = calendar.title;
    this.description = calendar.description;
    this.isAcademic = calendar.isAcademic;
  }
}
