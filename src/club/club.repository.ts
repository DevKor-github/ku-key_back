import { Injectable } from '@nestjs/common';
import { ClubEntity } from 'src/entities/club.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ClubRepository extends Repository<ClubEntity> {
  constructor(dataSource: DataSource) {
    super(ClubEntity, dataSource.createEntityManager());
  }

  async findClubsByFiltering(
    category?: string,
    keyword?: string,
  ): Promise<ClubEntity[]> {
    const queryBuilder = this.createQueryBuilder('club');

    // 키워드가 존재하면 카테고리 존재해도 카테고리 필터링 X
    if (keyword) {
      queryBuilder.andWhere('club.name LIKE :keyword', {
        keyword: `${keyword}%`,
      });
    } else if (category) {
      queryBuilder.andWhere('club.category = :category', { category });
    }

    // 찜 여부를 함께 반환
    queryBuilder
      .leftJoinAndSelect('club.clubLikes', 'clubLike')
      .leftJoinAndSelect('clubLike.user', 'user');

    return queryBuilder.getMany();
  }
}
