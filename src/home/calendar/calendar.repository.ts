import { Injectable } from '@nestjs/common';
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
  ): Promise<CalendarEntity> {
    const calendarData = this.create({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      title,
      description,
    });

    return await this.save(calendarData);
  }

  async updateCalendarData(
    calendarId: number,
    requestDto: UpdateCalendarDataRequestDto,
  ): Promise<boolean> {
    const updateData: any = { ...requestDto };

    if (requestDto.startDate) {
      updateData.startDate = new Date(requestDto.startDate);
    }

    if (requestDto.endDate) {
      updateData.endDate = new Date(requestDto.endDate);
    }

    const updated = await this.update({ id: calendarId }, updateData);

    return updated.affected ? true : false;
  }

  async deleteCalendarData(calendarId: number): Promise<boolean> {
    const deleted = await this.softDelete({ id: calendarId });

    return deleted.affected ? true : false;
  }
}
