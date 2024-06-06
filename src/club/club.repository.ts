import { Injectable } from '@nestjs/common';
import { ClubEntity } from 'src/entities/club.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ClubRepository extends Repository<ClubEntity> {
  constructor(dataSource: DataSource) {
    super(ClubEntity, dataSource.createEntityManager());
  }

  async findClubsByFiltering(category?: string): Promise<ClubEntity[]> {
    const queryBuilder = this.createQueryBuilder('club');

    if (category) {
      queryBuilder.andWhere('club.category = :category', { category });
    }

    // 찜 여부를 함께 반환
    queryBuilder
      .leftJoinAndSelect('club.clubLikes', 'clubLike')
      .leftJoinAndSelect('clubLike.user', 'user');

    return queryBuilder.getMany();
  }
}
