import { ClubLikeRepository } from './club-like.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { GetClubResponseDto } from './dto/get-club-response.dto';
import { ClubSearchQueryDto } from './dto/club-search-query.dto';
import { GetHotClubResponseDto } from './dto/get-hot-club-response.dto';
import { DataSource } from 'typeorm';
import { ClubEntity } from 'src/entities/club.entity';
import { ClubLikeEntity } from 'src/entities/club-like.entity';

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
    const { like, category, keyword } = clubSearchQueryDto;

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
    const clubList = clubs.map((club) => {
      const isLiked = club.clubLikes.some(
        (clubLike) => clubLike.user.id === userId,
      );
      return {
        clubId: club.id,
        name: club.name,
        summary: club.summary,
        regularMeeting: club.regularMeeting,
        recruitmentPeriod: club.recruitmentPeriod,
        description: club.description,
        imageUrl: club.imageUrl,
        likeCount: club.allLikes,
        isLiked: isLiked,
      };
    });

    // 찜한 동아리만 보기 시
    if (like) {
      return clubList.filter((club) => club.isLiked === true);
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
        const newClubLike = this.clubLikeRepository.create({
          club: { id: clubId },
          user: { id: userId },
        });
        club.allLikes++;
        await queryRunner.manager.save(newClubLike);
        await queryRunner.manager.save(club);
        await queryRunner.commitTransaction();

        return {
          clubId: club.id,
          name: club.name,
          summary: club.summary,
          regularMeeting: club.regularMeeting,
          recruitmentPeriod: club.recruitmentPeriod,
          description: club.description,
          imageUrl: club.imageUrl,
          likeCount: club.allLikes,
          isLiked: true,
        };
      } else {
        await queryRunner.manager.delete(ClubLikeEntity, { id: clubLike.id });
        club.allLikes--;
        await queryRunner.manager.save(club);
        await queryRunner.commitTransaction();

        return {
          clubId: club.id,
          name: club.name,
          summary: club.summary,
          regularMeeting: club.regularMeeting,
          recruitmentPeriod: club.recruitmentPeriod,
          description: club.description,
          imageUrl: club.imageUrl,
          likeCount: club.allLikes,
          isLiked: false,
        };
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

    // hotClubs의 개수가 4개 미만인 경우, 전체 찜 개수 기준으로 높은 것부터 선택하여 부족한 수를 채움
    const additionalClubsNeeded = 4 - hotClubs.length;
    const allClubs = await this.clubRepository.find({
      take: 4,
      order: { allLikes: 'DESC' },
    });

    // 전체 찜 개수 기준으로 가져온 동아리 중 hotClubs내에 이미 포함된 경우 제거
    const existingClubIds = new Set(hotClubs.map((hc) => hc.id));
    const additionalClubs = allClubs
      .filter((club) => !existingClubIds.has(club.id))
      .slice(0, additionalClubsNeeded);

    const combinedClubs = [...hotClubs, ...additionalClubs];
    let ranking = 1;

    return combinedClubs.map((club) => {
      const dto = new GetHotClubResponseDto();
      dto.name = club.name;
      dto.summary = club.summary;
      dto.imageUrl = club.imageUrl;
      dto.category = club.category;
      dto.ranking = ranking++;
      return dto;
    });
  }
}
