import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClubService } from './club.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
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
import { GetHotClubResponseDto } from './dto/get-hot-club-response.dto';
import { GetRecommendClubResponseDto } from './dto/get-recommend-club-response.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { GetClubRequestDto } from './dto/get-club-request';
import { GetRecommendClubRequestDto } from './dto/get-recommend-club-request.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateClubRequestDto } from './dto/create-club-request-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateClubResponseDto } from './dto/create-club-response-dto';
import { UpdateClubRequestDto } from './dto/update-club-request-dto';
import { UpdateClubResponseDto } from './dto/update-club-response-dto';
import { DeleteClubResponseDto } from './dto/delete-club-response-dto';

@Controller('club')
@ApiTags('club')
@ApiBearerAuth('accessToken')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: '동아리 목록 조회',
    description:
      '동아리 전체 목록을 조회하거나, 좋아요 여부, 소속/분과, 검색어(동아리명, 동아리 요약)로 필터링 및 좋아요 순으로 정렬하여 조회합니다.',
  })
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 방식 (좋아요 순 : like)',
    required: false,
  })
  @ApiQuery({
    name: 'wishList',
    description: '좋아요 누른 동아리만 필터링 (true / false)',
    required: false,
  })
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
  @ApiQuery({
    name: 'isLogin',
    description: '로그인 여부',
    required: true,
  })
  @ApiOkResponse({
    description: '전체 혹은 필터링/정렬 된 동아리 목록 반환',
    isArray: true,
    type: GetClubResponseDto,
  })
  async getClubList(
    @User() user: AuthorizedUserDto | null,
    @Query() getClubRequestDto: GetClubRequestDto,
  ): Promise<GetClubResponseDto[]> {
    return await this.clubService.getClubList(user, getClubRequestDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Post('/like/:clubId')
  @ApiOperation({
    summary: '동아리 좋아요 등록/해제',
    description:
      '이미 동아리 좋아요 눌러져 있으면 해제, 그렇지 않다면 좋아요 등록',
  })
  @ApiParam({
    description: '좋아요 누를 동아리 id',
    name: 'clubId',
    type: Number,
  })
  @ApiCreatedResponse({
    description: '좋아요 여부 및 좋아요 개수가 업데이트된 동아리 정보 반환',
    type: GetClubResponseDto,
  })
  async toggleLikeClub(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('clubId') clubId: number,
  ): Promise<GetClubResponseDto> {
    const userId = user.id;
    return await this.clubService.toggleLikeClub(
      transactionManager,
      userId,
      clubId,
    );
  }

  @Get('hot')
  @ApiOperation({
    summary: 'Hot Club 목록 조회',
    description:
      '최근 일주일 동안 좋아요 개수가 가장 많은 동아리 4개를 반환합니다.',
  })
  @ApiOkResponse({
    description: 'Hot Club 목록 4개 반환',
    isArray: true,
    type: GetHotClubResponseDto,
  })
  async getHotClubList(): Promise<GetHotClubResponseDto[]> {
    return await this.clubService.getHotClubList();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('recommend')
  @ApiOperation({
    summary: 'Recommend Club 목록 조회',
    description:
      '최초에 무작위로 추천, 이후 좋아요를 누른 동아리가 있다면 그와 같은 카테고리 내에서 추천',
  })
  @ApiQuery({
    name: 'isLogin',
    description: '로그인 여부',
    required: true,
  })
  @ApiOkResponse({
    description: 'Recommend Club 목록 4개 반환',
    isArray: true,
    type: GetRecommendClubResponseDto,
  })
  async getRecommendClubList(
    @User() user: AuthorizedUserDto | null,
    @Query() getRecommendClubRequestDto: GetRecommendClubRequestDto,
  ): Promise<GetRecommendClubResponseDto[]> {
    return await this.clubService.getRecommendClubList(
      user,
      getRecommendClubRequestDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @UseInterceptors(FileInterceptor('clubImage'))
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '동아리 생성',
    description: 'Admin page에서 새로운 동아리를 생성합니다.',
  })
  @ApiBody({ type: CreateClubRequestDto })
  @ApiCreatedResponse({
    description: '동아리 생성 성공',
    type: CreateClubResponseDto,
  })
  async createClub(
    @UploadedFile() clubImage: Express.Multer.File,
    @Body() body: CreateClubRequestDto,
  ): Promise<CreateClubResponseDto> {
    return await this.clubService.createClub(clubImage, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @UseInterceptors(FileInterceptor('clubImage'))
  @Patch('/:clubId')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '동아리 정보 수정',
    description: '동아리 id를 받아 admin page에서 동아리 정보를 수정합니다.',
  })
  @ApiParam({ name: 'clubId', description: '동아리 id' })
  @ApiBody({ type: UpdateClubRequestDto })
  @ApiOkResponse({
    description: '동아리 정보 수정 성공',
    type: UpdateClubResponseDto,
  })
  async updateClub(
    @Param('clubId') clubId: number,
    @UploadedFile() clubImage: Express.Multer.File,
    @Body() body: UpdateClubRequestDto,
  ) {
    return await this.clubService.updateClub(clubId, clubImage, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete('/:clubId')
  @ApiOperation({
    summary: '동아리 정보 삭제',
    description: '동아리 id를 받아 admin page에서 동아리 정보를 삭제합니다.',
  })
  @ApiParam({ name: 'clubId', description: '동아리 id' })
  @ApiOkResponse({
    description: '동아리 정보 삭제 성공',
    type: DeleteClubResponseDto,
  })
  async deleteClub(
    @Param('clubId') clubId: number,
  ): Promise<DeleteClubResponseDto> {
    return await this.clubService.deleteClub(clubId);
  }
}
