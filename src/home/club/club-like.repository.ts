import { Injectable } from '@nestjs/common';
import { ClubLikeEntity } from 'src/entities/club-like.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ClubLikeRepository extends Repository<ClubLikeEntity> {
  constructor(dataSource: DataSource) {
    super(ClubLikeEntity, dataSource.createEntityManager());
  }
}
