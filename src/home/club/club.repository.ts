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

    // 카테고리, 키워드로 필터링
    if (category) {
      queryBuilder.andWhere('club.category = :category', { category });
    }

    if (keyword) {
      queryBuilder
        .andWhere('club.name LIKE :keyword', {
          keyword: `${keyword}%`,
        })
        .orWhere('club.summary LIKE :keyword', { keyword: `%${keyword}%` });
    }

    // 찜 여부를 함께 반환
    queryBuilder
      .leftJoinAndSelect('club.clubLikes', 'clubLike')
      .leftJoinAndSelect('clubLike.user', 'user');

    return queryBuilder.getMany();
  }

  async findClubsByIdOrder(clubIds: number[]): Promise<ClubEntity[]> {
    const clubs = await this.createQueryBuilder('club')
      .where('club.id IN (:...ids)', { ids: clubIds })
      .orderBy(`FIELD(club.id, ${clubIds.join(',')})`)
      .getMany();

    return clubs;
  }
}
