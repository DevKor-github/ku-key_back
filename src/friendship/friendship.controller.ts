import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FriendshipService } from './friendship.service';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SendFriendshipRequestDto } from './dto/send-friendship-request.dto';
import { SendFriendshipResponseDto } from './dto/send-friendship-response.dto';
import { User } from 'src/decorators/user.decorator';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFriendList() {}

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

  @UseGuards()
  @Get('received')
  async getFriendshipRequests() {}

  @UseGuards()
  @Patch('received/:friendId')
  async acceptFriendshipRequest() {}

  @UseGuards()
  @Get('/:friendId/timetable')
  async getFriendTimetable() {}
}
