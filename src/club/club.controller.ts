import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClubService } from './club.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { GetClubResponseDto } from './dto/get-club-response.dto';

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
      '동아리 전체 목록을 조회하거나, 찜 여부 혹은 소속/분과별로 필터링하여 조회합니다.',
  })
  @ApiQuery({ name: 'like', description: '찜 여부 필터링을', required: false })
  @ApiQuery({
    name: 'category',
    description: '소속/분과별 필터링',
    required: false,
  })
  @ApiOkResponse({
    description: '전체 혹은 필터링 된 동아리 목록 반환',
    isArray: true,
    type: GetClubResponseDto,
  })
  async getClubList(
    @User() user: AuthorizedUserDto,
    @Query('like') like?: string,
    @Query('category') category?: string,
  ): Promise<GetClubResponseDto[]> {
    const userId = user.id;
    return await this.clubService.getClubList(userId, like, category);
  }
}
