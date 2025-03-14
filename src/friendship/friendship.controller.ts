import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FriendshipService } from './friendship.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SendFriendshipRequestDto } from './dto/send-friendship-request.dto';
import { SendFriendshipResponseDto } from './dto/send-friendship-response.dto';
import { User } from 'src/decorators/user.decorator';
import { GetFriendResponseDto } from './dto/get-friend-response.dto';
import { GetWaitingFriendResponseDto } from './dto/get-waiting-friend-response.dto';
import { UpdateFriendshipResponseDto } from './dto/update-friendship-response.dto';
import { DeleteFriendshipResponseDto } from './dto/delete-friendship-response.dto';
import { SearchUserResponseDto } from './dto/search-user-response.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetFriendTimetableRequestDto } from './dto/get-friend-timetable.dto';
import { GetTimetableByTimetableIdDto } from 'src/timetable/dto/get-timetable-timetable.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { SearchUserRequestDto } from './dto/search-user-query.dto';
import { FriendshipDocs } from 'src/decorators/docs/friendship.decorator';
import { GetReceivedFriendshipRequestCountDto } from './dto/get-received-friendship-request-count.dto';

@Controller('friendship')
@ApiTags('friendship')
@ApiBearerAuth('accessToken')
@FriendshipDocs
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFriendList(
    @User() user: AuthorizedUserDto,
    @Query('keyword') keyword?: string,
  ): Promise<GetFriendResponseDto[]> {
    return await this.friendshipService.getFriendList(user.id, keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search-user')
  async searchUserForFriendshipRequest(
    @User() user: AuthorizedUserDto,
    @Query() searchUserRequestDto: SearchUserRequestDto,
  ): Promise<SearchUserResponseDto> {
    return await this.friendshipService.searchUserForFriendshipRequest(
      user.id,
      searchUserRequestDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('friend-timetable')
  async getFriendTimetable(
    @User() user: AuthorizedUserDto,
    @Query() getFriendTimetableRequestDto: GetFriendTimetableRequestDto,
  ): Promise<GetTimetableByTimetableIdDto | { timetable: null }> {
    return await this.friendshipService.getFriendTimetable(
      user.id,
      getFriendTimetableRequestDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(TransactionInterceptor)
  async sendFriendshipRequest(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Body() sendFriendDto: SendFriendshipRequestDto,
  ): Promise<SendFriendshipResponseDto> {
    return await this.friendshipService.sendFriendshipRequest(
      transactionManager,
      user,
      sendFriendDto.toUsername,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  @UseInterceptors(TransactionInterceptor)
  async getReceivedWaitingFriendList(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
  ): Promise<GetWaitingFriendResponseDto[]> {
    return await this.friendshipService.getReceivedWaitingFriendList(
      transactionManager,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('received/count')
  async getReceivedFriendshipRequestCount(
    @User() user: AuthorizedUserDto,
  ): Promise<GetReceivedFriendshipRequestCountDto> {
    return await this.friendshipService.getReceivedFriendshipRequestCount(
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('sent')
  async getSentWaitingFriendList(
    @User() user: AuthorizedUserDto,
  ): Promise<GetWaitingFriendResponseDto[]> {
    return await this.friendshipService.getSentWaitingFriendList(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('received/:friendshipId')
  @UseInterceptors(TransactionInterceptor)
  async acceptFriendshipRequest(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('friendshipId') friendshipId: number,
  ): Promise<UpdateFriendshipResponseDto> {
    return await this.friendshipService.acceptFriendshipRequest(
      transactionManager,
      user,
      friendshipId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('received/:friendshipId')
  @UseInterceptors(TransactionInterceptor)
  async rejectFriendshipRequest(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('friendshipId') friendshipId: number,
  ): Promise<DeleteFriendshipResponseDto> {
    return await this.friendshipService.rejectFriendshipRequest(
      transactionManager,
      user.id,
      friendshipId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sent/:friendshipId')
  @UseInterceptors(TransactionInterceptor)
  async cancelFriendshipRequest(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('friendshipId') friendshipId: number,
  ): Promise<DeleteFriendshipResponseDto> {
    return await this.friendshipService.cancelFriendshipRequest(
      transactionManager,
      user.id,
      friendshipId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:friendshipId')
  @UseInterceptors(TransactionInterceptor)
  async deleteFriendship(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('friendshipId') friendshipId: number,
  ): Promise<DeleteFriendshipResponseDto> {
    return await this.friendshipService.deleteFriendship(
      transactionManager,
      user.id,
      friendshipId,
    );
  }
}
