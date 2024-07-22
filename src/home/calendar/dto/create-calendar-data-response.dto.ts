import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from 'src/entities/calendar.entity';

export class CreateCalendarDataResponseDto {
  @ApiProperty({ description: '행사/일정 id' })
  id: number;

  @ApiProperty({ description: '날짜 (AAAA-BB-CC 형식)' })
  date: Date;

  @ApiProperty({ description: '행사/일정 제목' })
  title: string;

  @ApiProperty({ description: '행사/일정 설명' })
  description: string;

  constructor(calendar: CalendarEntity) {
    this.id = calendar.id;
    this.date = calendar.date;
    this.title = calendar.title;
    this.description = calendar.description;
  }
}
