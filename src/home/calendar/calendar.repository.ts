import { Injectable } from '@nestjs/common';
import { CalendarEntity } from 'src/entities/calendar.entity';
import {
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

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
}
