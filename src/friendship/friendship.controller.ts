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
    const userId = user.id;
    return await this.friendshipService.getFriendList(userId, keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search-user')
  async searchUserForFriendshipRequest(
    @Query() searchUserRequestDto: SearchUserRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SearchUserResponseDto> {
    const myId = user.id;
    return await this.friendshipService.searchUserForFriendshipRequest(
      myId,
      searchUserRequestDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('friend-timetable')
  async getFriendTimetable(
    @Query() getFriendTimetableRequestDto: GetFriendTimetableRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimetableByTimetableIdDto> {
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
    @Body() sendFriendDto: SendFriendshipRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SendFriendshipResponseDto> {
    const toUsername = sendFriendDto.toUsername;
    return await this.friendshipService.sendFriendshipRequest(
      transactionManager,
      user,
      toUsername,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  async getReceivedWaitingFriendList(
    @User() user: AuthorizedUserDto,
  ): Promise<GetWaitingFriendResponseDto[]> {
    const userId = user.id;
    return await this.friendshipService.getReceivedWaitingFriendList(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sent')
  async getSentWaitingFriendList(
    @User() user: AuthorizedUserDto,
  ): Promise<GetWaitingFriendResponseDto[]> {
    const userId = user.id;
    return await this.friendshipService.getSentWaitingFriendList(userId);
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
    const userId = user.id;
    return await this.friendshipService.rejectFriendshipRequest(
      transactionManager,
      userId,
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
    const userId = user.id;
    return await this.friendshipService.cancelFriendshipRequest(
      transactionManager,
      userId,
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
    const userId = user.id;
    return await this.friendshipService.deleteFriendship(
      transactionManager,
      userId,
      friendshipId,
    );
  }
}
