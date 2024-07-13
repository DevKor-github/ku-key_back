import { Injectable } from '@nestjs/common';
import { CalendarEntity } from 'src/entities/calendar.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CalendarRepository extends Repository<CalendarEntity> {
  constructor(dataSource: DataSource) {
    super(CalendarEntity, dataSource.createEntityManager());
  }

  async createcalendarData(
    date: string,
    title: string,
    description: string,
  ): Promise<CalendarEntity> {
    const calendarData = this.create({
      date: new Date(date),
      title,
      description,
    });

    return await this.save(calendarData);
  }
}
