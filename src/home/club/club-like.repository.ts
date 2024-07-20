import { Injectable } from '@nestjs/common';
import { ClubLikeEntity } from 'src/entities/club-like.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ClubLikeRepository extends Repository<ClubLikeEntity> {
  constructor(dataSource: DataSource) {
    super(ClubLikeEntity, dataSource.createEntityManager());
  }

  async findTopLikedClubsInfo(): Promise<
    { clubId: number; likeCount: number }[]
  > {
    // oneWeekAgo를 일주일 전의 Date로 저장
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 일주일 간 좋아요 개수가 가장 많은 동아리 4개 반환, 좋아요 개수가 같은 경우 랜덤 선택
    const topClubLikes = await this.createQueryBuilder('club_like')
      .select('club_like.clubId')
      .addSelect('COUNT(club_like.id)', 'likeCount')
      .where('club_like.createdAt >= :oneWeekAgo', { oneWeekAgo })
      .groupBy('club_like.clubId')
      .orderBy('likeCount', 'DESC')
      .addOrderBy('RAND()')
      .limit(4)
      .getRawMany();

    return topClubLikes;
  }

  async findLikedClubCategories(userId: number): Promise<string[]> {
    // 좋아요 누른 동아리의 카테고리 정보
    const likedClubCategories = await this.createQueryBuilder('club_like')
      .leftJoinAndSelect('club_like.club', 'club')
      .where('club_like.user.id = :userId', { userId })
      .select('club.category')
      .distinct(true)
      .getRawMany();

    return likedClubCategories.map((clubLike) => clubLike.club_category);
  }
}
