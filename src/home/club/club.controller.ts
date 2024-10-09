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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { DeleteClubResponseDto } from './dto/delete-club-response-dto';
import { ClubDocs } from 'src/decorators/docs/club.decorator';

@Controller('club')
@ApiTags('club')
@ApiBearerAuth('accessToken')
@ClubDocs
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getClubList(
    @User() user: AuthorizedUserDto | null,
    @Query() getClubRequestDto: GetClubRequestDto,
  ): Promise<GetClubResponseDto[]> {
    return await this.clubService.getClubList(user, getClubRequestDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Post('/like/:clubId')
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
  async getHotClubList(): Promise<GetHotClubResponseDto[]> {
    return await this.clubService.getHotClubList();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('recommend')
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
  async deleteClub(
    @Param('clubId') clubId: number,
  ): Promise<DeleteClubResponseDto> {
    return await this.clubService.deleteClub(clubId);
  }
}
