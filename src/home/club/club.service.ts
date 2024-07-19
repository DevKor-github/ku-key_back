import { ClubLikeRepository } from './club-like.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { GetClubResponseDto } from './dto/get-club-response.dto';
import { ClubSearchQueryDto } from './dto/club-search-query.dto';
import { GetHotClubResponseDto } from './dto/get-hot-club-response.dto';
import { DataSource } from 'typeorm';
import { ClubEntity } from 'src/entities/club.entity';
import { ClubLikeEntity } from 'src/entities/club-like.entity';
import { GetRecommendClubResponseDto } from './dto/get-recommend-club-response.dto';

@Injectable()
export class ClubService {
  constructor(
    private readonly clubRepository: ClubRepository,
    private readonly clubLikeRepository: ClubLikeRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getClubList(
    userId: number,
    clubSearchQueryDto: ClubSearchQueryDto,
  ): Promise<GetClubResponseDto[]> {
    // 카테고리가 있는 경우 카테고리로 필터링
    const { sortBy, wishList, category, keyword } = clubSearchQueryDto;

    const clubs = await this.clubRepository.findClubsByFiltering(
      category,
      keyword,
    );

    if (!clubs) {
      throw new NotFoundException('동아리 목록을 불러오는데 실패했습니다.');
    }

    // 반환할 동아리가 없는 경우
    if (clubs.length === 0) {
      return [];
    }

    // 현재 접속 중인 유저의 각 동아리에 대한 찜 여부 함께 반환
    let clubList = clubs.map((club) => {
      const isLiked = club.clubLikes.some(
        (clubLike) => clubLike.user.id === userId,
      );
      return new GetClubResponseDto(club, isLiked);
    });

    // 내가 좋아요를 누른 동아리만 보기
    if (wishList) {
      clubList = clubList.filter((club) => club.isLiked === true);
    }

    // 좋아요 순으로 정렬
    if (sortBy === 'like') {
      clubList = clubList.sort((a, b) => b.likeCount - a.likeCount);
    }

    return clubList;
  }

  async toggleLikeClub(
    userId: number,
    clubId: number,
  ): Promise<GetClubResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const club = await queryRunner.manager.findOne(ClubEntity, {
        where: { id: clubId },
      });

      if (!club) {
        throw new NotFoundException('동아리 정보를 찾을 수 없습니다.');
      }

      const clubLike = await queryRunner.manager.findOne(ClubLikeEntity, {
        where: {
          club: { id: clubId },
          user: { id: userId },
        },
      });

      if (!clubLike) {
        const newClubLike = queryRunner.manager.create(ClubLikeEntity, {
          club: { id: clubId },
          user: { id: userId },
        });

        await queryRunner.manager.update(ClubEntity, clubId, {
          allLikes: () => 'allLikes + 1',
        });
        club.allLikes++;
        await queryRunner.manager.save(newClubLike);
        await queryRunner.commitTransaction();

        return new GetClubResponseDto(club, true);
      } else {
        await queryRunner.manager.delete(ClubLikeEntity, { id: clubLike.id });
        await queryRunner.manager.update(ClubEntity, clubId, {
          allLikes: () => 'allLikes - 1',
        });
        club.allLikes--;
        await queryRunner.commitTransaction();

        return new GetClubResponseDto(club, false);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getHotClubList(): Promise<GetHotClubResponseDto[]> {
    const topLikedClubsInfo =
      await this.clubLikeRepository.findTopLikedClubsInfo();

    if (!topLikedClubsInfo) {
      throw new NotFoundException('동아리 목록을 불러오는데 실패했습니다.');
    }

    const hotClubIds = topLikedClubsInfo.map((info) => info.clubId);
    const hotClubs = await this.clubRepository.findClubsByIdOrder(hotClubIds);

    // hotClubs의 개수가 4개 미만인 경우, 전체 좋아요 개수 기준으로 높은 것부터 선택(좋아요 개수 같은 경우 랜덤 선택)하여 부족한 수를 채움
    const additionalClubsNeeded = 4 - hotClubs.length;
    const allClubs = await this.clubRepository.findClubsByAllLikesAndRandom();

    // 전체 찜 개수 기준으로 가져온 동아리 중 hotClubs내에 이미 포함된 경우 제거
    const existingClubIds = new Set(hotClubs.map((hc) => hc.id));
    const additionalClubs = allClubs
      .filter((club) => !existingClubIds.has(club.id))
      .slice(0, additionalClubsNeeded);

    const combinedClubs = [...hotClubs, ...additionalClubs];
    let ranking = 1;

    return combinedClubs.map((club) => {
      return new GetHotClubResponseDto(club, ranking++);
    });
  }

  async getRecommendClubList(
    userId: number,
  ): Promise<GetRecommendClubResponseDto[]> {
    const likedClubCategories =
      await this.clubLikeRepository.findLikedClubCategories(userId);

    // 좋아요 누른 동아리가 없을 경우 무작위로 4개 선정
    if (likedClubCategories.length === 0) {
      const recommendClubs = await this.clubRepository.findClubsByRandom();
      return recommendClubs.map((club) => {
        return new GetRecommendClubResponseDto(club);
      });
    }

    const recommendClubList: GetRecommendClubResponseDto[] = [];
    const clubsPerCategory = Math.ceil(4 / likedClubCategories.length);
    const shuffledCategories = this.shuffleArray(likedClubCategories);

    // 좋아요 누른 동아리의 카테고리 수에 따라 비율에 맞게 4개 선정
    for (const category of shuffledCategories) {
      const clubs = await this.clubRepository.findClubsByCategoryAndRandom(
        category,
        clubsPerCategory,
      );
      const recommendClubs = clubs.map((club) => {
        return new GetRecommendClubResponseDto(club);
      });
      recommendClubList.push(...recommendClubs);

      if (recommendClubs.length >= 4) break;
    }

    // 부족한 경우, 랜덤으로 채움
    if (recommendClubList.length < 4) {
      const existingClubNames = new Set(recommendClubList.map((rc) => rc.name));
      const randomClubs = await this.clubRepository.findClubsByRandom();
      const additionalClubs = randomClubs
        .filter((club) => !existingClubNames.has(club.name))
        .map((club) => {
          return new GetRecommendClubResponseDto(club);
        });
      recommendClubList.push(...additionalClubs);
    }

    // 앞에서부터 4개를 랜덤한 순서로 반환
    return this.shuffleArray(recommendClubList.slice(0, 4));
  }

  // 리스트를 랜덤하게 섞어서 반환하는 함수
  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
