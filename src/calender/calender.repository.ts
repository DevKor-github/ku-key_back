import { Injectable } from '@nestjs/common';
import { CalenderEntity } from 'src/entities/calender.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CalenderRepository extends Repository<CalenderEntity> {
  constructor(dataSource: DataSource) {
    super(CalenderEntity, dataSource.createEntityManager());
  }

  async createCalenderData(
    date: string,
    title: string,
    description: string,
  ): Promise<CalenderEntity> {
    const calenderData = this.create({
      date: new Date(date),
      title,
      description,
    });

    return await this.save(calenderData);
  }
}
