import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClubService } from './club.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { GetClubResponseDto } from './dto/get-club-response.dto';
import { LikeClubResponseDto } from './dto/like-club-response.dto';
import { ClubSearchQueryDto } from './dto/club-search-query.dto';

@Controller('club')
@ApiTags('club')
@ApiBearerAuth('accessToken')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: '동아리 목록 조회',
    description:
      '동아리 전체 목록을 조회하거나, 찜 여부, 소속/분과, 검색어(동아리명, 동아리 요약)로 필터링하여 조회합니다.',
  })
  @ApiQuery({ name: 'like', description: '찜 여부 필터링', required: false })
  @ApiQuery({
    name: 'category',
    description: '소속/분과별 필터링',
    required: false,
  })
  @ApiQuery({
    name: 'keyword',
    description: '동아리명/동아리 요약 검색 키워드',
    required: false,
  })
  @ApiOkResponse({
    description: '전체 혹은 필터링 된 동아리 목록 반환',
    isArray: true,
    type: GetClubResponseDto,
  })
  async getClubList(
    @User() user: AuthorizedUserDto,
    @Query() clubSearchQueryDto: ClubSearchQueryDto,
  ): Promise<GetClubResponseDto[]> {
    const userId = user.id;
    return await this.clubService.getClubList(userId, clubSearchQueryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/like/:clubId')
  @ApiOperation({
    summary: '동아리 찜 등록/해제',
    description: '이미 동아리 찜 눌러져 있으면 해제, 그렇지 않다면 찜 등록',
  })
  @ApiParam({ description: '찜 누를 동아리 id', name: 'clubId', type: Number })
  @ApiOkResponse({
    description: '찜 등록 시 liked: True, 해제 시 False 반환',
    type: LikeClubResponseDto,
  })
  async likeClub(
    @User() user: AuthorizedUserDto,
    @Param('clubId') clubId: number,
  ): Promise<LikeClubResponseDto> {
    const userId = user.id;
    return await this.clubService.likeClub(userId, clubId);
  }
}
