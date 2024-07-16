import { Injectable } from '@nestjs/common';
import { InstitutionEntity } from 'src/entities/institution.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class InstitutionRepository extends Repository<InstitutionEntity> {
  constructor(dataSource: DataSource) {
    super(InstitutionEntity, dataSource.createEntityManager());
  }
}
