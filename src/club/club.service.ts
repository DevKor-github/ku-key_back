import { Injectable, NotFoundException } from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { GetClubResponseDto } from './dto/get-club-response.dto';

@Injectable()
export class ClubService {
  constructor(private readonly clubRepository: ClubRepository) {}

  async getClubList(
    userId: number,
    like?: string,
    category?: string,
  ): Promise<GetClubResponseDto[]> {
    // 카테고리가 있는 경우 카테고리로 필터링
    const clubs = await this.clubRepository.findClubsByFiltering(category);

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
        activity: club.activity,
        isLiked: isLiked,
      };
    });

    // 찜한 동아리만 보기 시
    if (like === 'true') {
      return clubList.filter((club) => club.isLiked === true);
    }

    return clubList;
  }
}
