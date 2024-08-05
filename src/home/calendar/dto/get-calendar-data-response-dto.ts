import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from 'src/entities/calendar.entity';

class Event {
  @ApiProperty({ description: '행사/일정 id' })
  id: number;

  @ApiProperty({ description: '행사/일정 제목' })
  title: string;

  @ApiProperty({ description: '행사/일정 설명' })
  description: string;

  constructor(calendar: CalendarEntity) {
    this.id = calendar.id;
    this.title = calendar.title;
    this.description = calendar.description;
  }
}

export class GetDailyCalendarDataResponseDto {
  @ApiProperty({ description: '날짜 (AAAA-BB-CC 형식)' })
  date: Date;

  @ApiProperty({ description: '행사/일정 제목', type: [Event] })
  event: Event[];

  @ApiProperty({ description: '행사/일정 개수' })
  eventCount: number;

  constructor(date: Date, calendars: CalendarEntity[]) {
    this.date = date;
    this.event = calendars.map((calendar) => {
      return new Event(calendar);
    });
    this.eventCount = this.event.length;
  }
}

export class GetMonthlyCalendarDataResponseDto {
  @ApiProperty({ description: '월' })
  month: number;

  @ApiProperty({
    description: '월별 행사/일정',
    type: [GetDailyCalendarDataResponseDto],
  })
  monthEvents: GetDailyCalendarDataResponseDto[];

  constructor(month: number, monthEvents: GetDailyCalendarDataResponseDto[]) {
    this.month = month;
    this.monthEvents = monthEvents;
  }
}
