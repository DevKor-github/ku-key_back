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
    const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1)).getDay(); // 현재 월 시작 요일
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getDay(); // 현재 월 끝 요일

    const daysFromPrevMonth = firstDayOfMonth; // 저번 달에서 가져올 개수
    const daysFromNextMonth = 13 - lastDayOfMonth; // 다음 달에서 가져올 개수
    const startDate = new Date(
      Date.UTC(year, month - 1, -daysFromPrevMonth + 1),
    );
    const endDate = new Date(Date.UTC(year, month, daysFromNextMonth));
    // 시작 - 끝 날짜에 대한 이벤트들을 찾아서 각 날짜별로 묶어줌
    const monthEvents = await this.calendarRepository.find({
      where: { date: Between(startDate, endDate) },
    });
    const eventByDates = this.groupEventsByDate(monthEvents);
    const monthCalendarData: GetDailyCalendarDataResponseDto[] = [];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(
        startDate.getTime() + i * 24 * 60 * 60 * 1000,
      );
      const formattedDate = this.formatDate(currentDate);
      // 이벤트가 있으면 배열 형태로, 없다면 빈 배열
      const dayEvents = eventByDates.get(formattedDate) || [];

      const dayCalendarData = new GetDailyCalendarDataResponseDto(
        currentDate,
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
        (dayCalendarData) =>
          dayCalendarData.date.getMonth() === month - 1 &&
          dayCalendarData.eventCount !== 0,
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

  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
