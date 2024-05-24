import { Injectable } from '@nestjs/common';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TimeTableRepository extends Repository<TimeTableEntity> {
  constructor(dataSource: DataSource) {
    super(TimeTableEntity, dataSource.createEntityManager());
  }
}
