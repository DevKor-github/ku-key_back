import { Injectable } from '@nestjs/common';
import { TimetableEntity } from 'src/entities/timetable.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TimetableRepository extends Repository<TimetableEntity> {
  constructor(dataSource: DataSource) {
    super(TimetableEntity, dataSource.createEntityManager());
  }
}
