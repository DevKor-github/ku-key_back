import { Injectable } from '@nestjs/common';
import { CalendarEntity } from 'src/entities/calendar.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateCalendarDataRequestDto } from './dto/update-calendar-data-request.dto';

@Injectable()
export class CalendarRepository extends Repository<CalendarEntity> {
  constructor(dataSource: DataSource) {
    super(CalendarEntity, dataSource.createEntityManager());
  }

  async createCalendarData(
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

  async updateCalendarData(
    calendarId: number,
    requestDto: UpdateCalendarDataRequestDto,
  ): Promise<boolean> {
    if (requestDto.date) {
      const { date, ...others } = requestDto;
      const newDate = new Date(date);
      const updated = await this.update(
        { id: calendarId },
        { date: newDate, ...others },
      );
      return updated.affected ? true : false;
    }
    const updated = await this.update({ id: calendarId }, requestDto);

    return updated.affected ? true : false;
  }

  async deleteCalendarData(calendarId: number): Promise<boolean> {
    const deleted = await this.softDelete({ id: calendarId });

    return deleted.affected ? true : false;
  }
}
