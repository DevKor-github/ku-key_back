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
} from '@nestjs/common';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SendFriendshipRequestDto } from './dto/send-friendship-request.dto';
import { SendFriendshipResponseDto } from './dto/send-friendship-response.dto';
import { User } from 'src/decorators/user.decorator';
import { GetFriendResponseDto } from './dto/get-friend-response.dto';
import { GetWaitingFriendResponseDto } from './dto/get-waiting-friend-response.dto';
import { UpdateFriendshipResponseDto } from './dto/update-friendship-response.dto';
import { DeleteFriendshipResponseDto } from './dto/delete-friendship-response.dto';
import { RejectFriendshipResponseDto } from './dto/reject-friendship-response.dto';
import { SearchUserResponseDto } from './dto/search-user-response.dto';

@Controller('friendship')
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
    @Query('username') username: string,
    @User() user: AuthorizedUserDto,
  ): Promise<SearchUserResponseDto> {
    const myUsername = user.username;
    return await this.friendshipService.searchUserForFriendshipRequest(
      myUsername,
      username,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendFriendshipRequest(
    @Body() sendFriendDto: SendFriendshipRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SendFriendshipResponseDto> {
    const fromUserId = user.id;
    const toUsername = sendFriendDto.toUsername;
    return await this.friendshipService.sendFriendshipRequest(
      fromUserId,
      toUsername,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  async getWaitingFriendList(
    @User() user: AuthorizedUserDto,
  ): Promise<GetWaitingFriendResponseDto[]> {
    const userId = user.id;
    return await this.friendshipService.getWaitingFriendList(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('received/:friendshipId')
  async acceptFriendshipRequest(
    @User() user: AuthorizedUserDto,
    @Param('friendshipId') friendshipId: string,
  ): Promise<UpdateFriendshipResponseDto> {
    const userId = user.id;
    return await this.friendshipService.acceptFriendshipRequest(
      userId,
      Number(friendshipId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('received/:friendshipId')
  async rejectFriendshipRequest(
    @Param('friendshipId') friendshipId: string,
  ): Promise<RejectFriendshipResponseDto> {
    return await this.friendshipService.rejectFriendshipRequest(
      Number(friendshipId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:friendshipId')
  async deleteFriendship(
    @Param('friendshipId') friendshipId: string,
  ): Promise<DeleteFriendshipResponseDto> {
    return await this.friendshipService.deleteFriendship(Number(friendshipId));
  }
}
