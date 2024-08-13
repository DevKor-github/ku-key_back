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
import { CreateCalendarDataRequestDto } from './dto/create-calendar-data-request.dto';
import { CreateCalendarDataResponseDto } from './dto/create-calendar-data-response.dto';
import { UpdateCalendarDataRequestDto } from './dto/update-calendar-data-request.dto';
import { UpdateCalendarDataResponseDto } from './dto/update-calendar-data-response.dto';
import { DeleteCalendarDataResponseDto } from './dto/delete-calendar-data-response-dto';
import { GetAcademicScheduleDataResponseDto } from './dto/get-academic-schedule-response.dto';

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
    const { startDate, endDate } = this.getStartAndEndDate(year, month);

    // 해당 월에 걸쳐있는 모든 이벤트를 가져옴
    const monthEvents = await this.calendarRepository.getMonthEvents(
      startDate,
      endDate,
    );

    const monthCalendarData: GetDailyCalendarDataResponseDto[] = [];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(
        startDate.getTime() + i * 24 * 60 * 60 * 1000,
      );
      // 현재 날짜에 해당하는 이벤트 필터링
      const dayEvents = monthEvents.filter(
        (event) =>
          currentDate >= event.startDate && currentDate <= event.endDate,
      );

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

  async getAcademicScheduleData(
    year: number,
    semester: number,
  ): Promise<GetAcademicScheduleDataResponseDto[]> {
    const startMonth = semester === 1 ? 2 : 8;
    const endMonth = semester === 1 ? 8 : 14; // 13, 14는 다음해 1, 2월로 처리
    const academicScheduleData: GetAcademicScheduleDataResponseDto[] = [];

    for (let month = startMonth; month <= endMonth; month++) {
      const { startDate, endDate } = this.getStartAndEndDate(
        month > 12 ? year + 1 : year,
        month > 12 ? month - 12 : month,
      );
      const monthData = await this.calendarRepository.getMonthEvents(
        startDate,
        endDate,
      );
      // isAcademic이 true인 것만 반환
      const filteredData = monthData.filter(
        (data) =>
          data.endDate.getMonth() === month - 1 && data.isAcademic === true,
      );
      academicScheduleData.push(
        new GetAcademicScheduleDataResponseDto(
          month > 12 ? month - 12 : month,
          filteredData,
        ),
      );
    }
    return academicScheduleData;
  }

  async createCalendarData(
    requestDto: CreateCalendarDataRequestDto,
  ): Promise<CreateCalendarDataResponseDto> {
    const { startDate, endDate, title, description, isAcademic } = requestDto;
    const calendarData = await this.calendarRepository.createCalendarData(
      startDate,
      endDate,
      title,
      description,
      isAcademic,
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

    return await this.calendarRepository.updateCalendarData(
      calendarId,
      requestDto,
    );
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

  // 연도, 월 정보를 받아 캘린더의 시작 - 끝 날짜를 반환하는 함수
  private getStartAndEndDate(
    year: number,
    month: number,
  ): { startDate: Date; endDate: Date } {
    const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0));

    const daysFromPrevMonth = firstDayOfMonth.getDay();
    const daysFromNextMonth = 6 - lastDayOfMonth.getDay();
    const startDate = new Date(
      Date.UTC(year, month - 1, -daysFromPrevMonth + 1),
    );
    const endDate = new Date(
      Date.UTC(year, month - 1, lastDayOfMonth.getDate() + daysFromNextMonth),
    );

    return { startDate, endDate };
  }
}
