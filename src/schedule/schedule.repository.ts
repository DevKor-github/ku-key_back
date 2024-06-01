import { Injectable } from '@nestjs/common';
import { ScheduleEntity } from 'src/entities/schedule.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ScheduleRepository extends Repository<ScheduleEntity> {
  constructor(dataSource: DataSource) {
    super(ScheduleEntity, dataSource.createEntityManager());
  }
}
