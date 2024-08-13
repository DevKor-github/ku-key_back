import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CalendarEntity } from 'src/entities/calendar.entity';
import {
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { UpdateCalendarDataRequestDto } from './dto/update-calendar-data-request.dto';

@Injectable()
export class CalendarRepository extends Repository<CalendarEntity> {
  constructor(dataSource: DataSource) {
    super(CalendarEntity, dataSource.createEntityManager());
  }

  // startDate ~ endDate 사이의 데이터 가져오기
  async getMonthEvents(
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEntity[]> {
    return await this.find({
      where: [
        {
          startDate: LessThanOrEqual(endDate),
          endDate: MoreThanOrEqual(startDate),
        },
      ],
      order: {
        startDate: 'ASC',
      },
    });
  }

  async createCalendarData(
    startDate: string,
    endDate: string,
    title: string,
    description: string,
    isAcademic: boolean,
  ): Promise<CalendarEntity> {
    const calendarData = this.create({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      title,
      description,
      isAcademic,
    });

    return await this.save(calendarData);
  }

  async updateCalendarData(
    calendarId: number,
    requestDto: UpdateCalendarDataRequestDto,
  ): Promise<CalendarEntity> {
    const updateData = {
      ...requestDto,
      startDate: requestDto.startDate
        ? new Date(requestDto.startDate)
        : undefined,
      endDate: requestDto.endDate ? new Date(requestDto.endDate) : undefined,
    };

    const updated = await this.update({ id: calendarId }, updateData);

    if (updated.affected === 0) {
      throw new InternalServerErrorException('업데이트에 실패했습니다.');
    }

    return await this.findOne({ where: { id: calendarId } });
  }

  async deleteCalendarData(calendarId: number): Promise<boolean> {
    const deleted = await this.softDelete({ id: calendarId });

    return deleted.affected ? true : false;
  }
}
