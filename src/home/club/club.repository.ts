import { Injectable } from '@nestjs/common';
import { ClubCategory } from 'src/common/types/club-category-type';
import { ClubEntity } from 'src/entities/club.entity';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class ClubRepository extends Repository<ClubEntity> {
  constructor(dataSource: DataSource) {
    super(ClubEntity, dataSource.createEntityManager());
  }

  async findClubsByFiltering(
    category?: ClubCategory,
    keyword?: string,
    sortBy?: string,
  ): Promise<ClubEntity[]> {
    const queryBuilder = this.createQueryBuilder('club');

    // 카테고리, 키워드로 필터링
    if (category && ClubCategory.includes(category)) {
      queryBuilder.andWhere('club.category = :category', { category });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) =>
          qb
            .where('club.name LIKE :keyword', {
              keyword: `${keyword}%`,
            })
            .orWhere('club.summary LIKE :keyword', { keyword: `%${keyword}%` }),
        ),
      );
    }

    if (sortBy === 'like') {
      queryBuilder.orderBy({ 'club.allLikes': 'DESC' });
    }

    // 찜 여부를 함께 반환
    queryBuilder
      .leftJoinAndSelect('club.clubLikes', 'clubLike')
      .leftJoinAndSelect('clubLike.user', 'user');

    return queryBuilder.getMany();
  }

  async findClubsByIdOrder(clubIds: number[]): Promise<ClubEntity[]> {
    // hot club이 아직 없는 경우 빈 배열 반환
    if (clubIds.length === 0) {
      return [];
    }
    // 받은 id 순서대로 clubEntity를 찾아서 반환
    const clubs = await this.createQueryBuilder('club')
      .where('club.id IN (:...ids)', { ids: clubIds })
      .orderBy(`FIELD(club.id, ${clubIds.join(',')})`)
      .getMany();

    return clubs;
  }

  async findClubsByAllLikesAndRandom(): Promise<ClubEntity[]> {
    // allLikes 순서대로 5개 반환, allLikes 같은 경우 랜덤으로 선택
    return await this.createQueryBuilder('club')
      .orderBy('club.allLikes', 'DESC')
      .addOrderBy('RAND()')
      .limit(5)
      .getMany();
  }

  async findClubsByRandom(): Promise<ClubEntity[]> {
    // 랜덤 5개 반환
    return await this.createQueryBuilder('club')
      .orderBy('RAND()')
      .limit(5)
      .getMany();
  }

  async findClubsByCategoryAndRandom(
    category: string,
    limit: number,
  ): Promise<ClubEntity[]> {
    // 카테고리에 속한 club 랜덤하게 limit 만큼 선택하여 반환
    return await this.createQueryBuilder('club')
      .where('club.category = :category', { category })
      .orderBy('RAND()')
      .limit(limit)
      .getMany();
  }
}
