import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarRepository } from './calendar.repository';
import {
  GetDailyCalendarDataResponseDto,
  GetMonthlyCalendarDataResponseDto,
} from './dto/get-calendar-data-response-dto';
import { CalendarEntity } from 'src/entities/calendar.entity';
import { CreateCalendarDataRequestDto } from './dto/create-calendar-data-request.dto';
import { CreateCalendarDataResponseDto } from './dto/create-calendar-data-response.dto';
import { Between } from 'typeorm';
import { UpdateCalendarDataRequestDto } from './dto/update-calendar-data-request.dto';
import { UpdateCalendarDataResponseDto } from './dto/update-calendar-data-response.dto';
import { DeleteCalendarDataResponseDto } from './dto/delete-calendar-data-response-dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarRepository)
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async getMonthlyCalendarData(
    year: number,
    month: number,
  ): Promise<GetDailyCalendarDataResponseDto[]> {
    const monthDays = this.getDaysInMonth(year, month);
    // 시작 - 끝 날짜 생성, month = 7로 받았을 경우 '07'로 입력해주기 위해 padStart 사용
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const endDate = new Date(
      `${year}-${String(month).padStart(2, '0')}-${String(monthDays).padStart(2, '0')}`,
    );
    // 시작 - 끝 날짜에 대한 이벤트들을 찾아서 각 날짜별로 묶어줌
    const monthEvents = await this.calendarRepository.find({
      where: { date: Between(startDate, endDate) },
    });
    const eventByDates = this.groupEventsByDate(monthEvents);
    const monthCalendarData: GetDailyCalendarDataResponseDto[] = [];

    for (let day = 1; day <= monthDays; day++) {
      const currentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // 이벤트가 있으면 배열 형태로, 없다면 빈 배열
      const dayEvents = eventByDates.get(currentDate) || [];

      const dayCalendarData = new GetDailyCalendarDataResponseDto(
        new Date(currentDate),
        dayEvents,
      );
      monthCalendarData.push(dayCalendarData);
    }

    return monthCalendarData;
  }

  async getYearlyCalendarData(year: number) {
    const allCalendarData: GetMonthlyCalendarDataResponseDto[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthCalendarData = await this.getMonthlyCalendarData(year, month);
      const filteredData = monthCalendarData.filter(
        (dayCalendarData) => dayCalendarData.eventCount !== 0,
      );
      allCalendarData.push(
        new GetMonthlyCalendarDataResponseDto(month, filteredData),
      );
    }
    return allCalendarData;
  }

  async createCalendarData(
    requestDto: CreateCalendarDataRequestDto,
  ): Promise<CreateCalendarDataResponseDto> {
    const { date, title, description } = requestDto;
    const calendarData = await this.calendarRepository.createCalendarData(
      date,
      title,
      description,
    );

    if (!calendarData) {
      throw new InternalServerErrorException('행사/일정 생성에 실패했습니다.');
    }

    return new CreateCalendarDataResponseDto(calendarData);
  }

  async updateCalendarData(
    calendarId: number,
    requestDto: UpdateCalendarDataRequestDto,
  ): Promise<UpdateCalendarDataResponseDto> {
    const calendarData = await this.calendarRepository.findOne({
      where: { id: calendarId },
    });

    if (!calendarData) {
      throw new NotFoundException('행사/일정 정보가 없습니다.');
    }

    const isUpdated = await this.calendarRepository.updateCalendarData(
      calendarId,
      requestDto,
    );

    if (!isUpdated) {
      throw new InternalServerErrorException('업데이트에 실패했습니다.');
    }

    return new UpdateCalendarDataResponseDto(true);
  }

  async deleteCalendarData(
    calendarId: number,
  ): Promise<DeleteCalendarDataResponseDto> {
    const calendarData = await this.calendarRepository.findOne({
      where: { id: calendarId },
    });

    if (!calendarData) {
      throw new NotFoundException('행사/일정 정보가 없습니다.');
    }

    const isDeleted =
      await this.calendarRepository.deleteCalendarData(calendarId);

    if (!isDeleted) {
      throw new InternalServerErrorException('삭제에 실패했습니다.');
    }

    return new DeleteCalendarDataResponseDto(true);
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
