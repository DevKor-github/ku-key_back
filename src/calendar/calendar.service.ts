import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarRepository } from './calendar.repository';
import { GetCalendarDataResponseDto } from './dto/get-calendar-data-response-dto';
// import { Between } from 'typeorm';
import { CalendarEntity } from 'src/entities/calendar.entity';
import { CreateCalendarDataRequestDto } from './dto/create-calendar-data-request.dto';
import { CreateCalendarDataResponseDto } from './dto/create-calendar-response.dto';
import { Between } from 'typeorm';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarRepository)
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async getCalendarData(
    year: number,
    month: number,
  ): Promise<GetCalendarDataResponseDto[]> {
    const monthDays = this.getDaysInMonth(year, month);
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const endDate = new Date(
      `${year}-${String(month).padStart(2, '0')}-${String(monthDays).padStart(2, '0')}`,
    );

    const monthEvents = await this.calendarRepository.find({
      where: { date: Between(startDate, endDate) },
    });
    const eventByDates = this.groupEventsByDate(monthEvents);
    const monthCalendarData: GetCalendarDataResponseDto[] = [];

    for (let day = 1; day <= monthDays; day++) {
      const currentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = eventByDates.get(currentDate) || [];

      const dayCalendarData = new GetCalendarDataResponseDto();
      dayCalendarData.date = new Date(currentDate);
      dayCalendarData.event = dayEvents.map((event) => ({
        title: event.title,
        description: event.description,
      }));

      monthCalendarData.push(dayCalendarData);
    }

    return monthCalendarData;
  }

  async createcalendarData(
    requestDto: CreateCalendarDataRequestDto,
  ): Promise<CreateCalendarDataResponseDto> {
    const { date, title, description } = requestDto;
    const calendarData = await this.calendarRepository.createcalendarData(
      date,
      title,
      description,
    );

    return {
      date: calendarData.date,
      title: calendarData.title,
      description: calendarData.description,
    };
  }

  // 월-날짜 매핑 함수
  private getDaysInMonth(year: number, month: number): number {
    const monthDays = {
      1: 31,
      2: 28,
      3: 31,
      4: 30,
      5: 31,
      6: 30,
      7: 31,
      8: 31,
      9: 30,
      10: 31,
      11: 30,
      12: 31,
    };

    if (month < 1 || month > 12) {
      throw new Error('Invalid month');
    }

    if (month === 2 && this.isLeapYear(year)) {
      return 29;
    }

    return monthDays[month];
  }

  // 윤년인지 계산하는 함수
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // 날짜별 이벤트를 묶어주는 함수
  private groupEventsByDate(
    events: CalendarEntity[],
  ): Map<string, CalendarEntity[]> {
    const eventMap = new Map<string, CalendarEntity[]>();
    for (const event of events) {
      const dateKey = event.date.toISOString().split('T')[0];
      if (!eventMap.has(dateKey)) {
        eventMap.set(dateKey, []);
      }
      eventMap.get(dateKey)!.push(event);
    }

    return eventMap;
  }
}
