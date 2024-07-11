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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetFriendTimeTableRequestDto } from './dto/get-friend-timetable.dto';
import { GetTimeTableByTimeTableIdDto } from 'src/timetable/dto/get-timetable-timetable.dto';
import { SearchUserQueryDto } from './dto/search-user-query.dto';

@Controller('friendship')
@ApiTags('friendship')
@ApiBearerAuth('accessToken')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: '친구 목록 조회',
    description:
      '전체 친구 목록을 조회하거나, keyword를 query로 받아 친구 목록을 필터링하여 조회합니다.',
  })
  @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드' })
  @ApiOkResponse({
    description: '전체 혹은 필터링 된 친구 목록 반환',
    isArray: true,
    type: GetFriendResponseDto,
  })
  async getFriendList(
    @User() user: AuthorizedUserDto,
    @Query('keyword') keyword?: string,
  ): Promise<GetFriendResponseDto[]> {
    const userId = user.id;
    return await this.friendshipService.getFriendList(userId, keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search-user')
  @ApiOperation({
    summary: '친구 추가를 위한 유저 검색',
    description:
      'username(친구 추가용 id)를 query로 받아 해당하는 유저를 검색합니다.',
  })
  @ApiQuery({ name: 'username', description: '친구 추가용 id', required: true })
  @ApiOkResponse({
    description: '검색된 유저 정보 반환',
    type: SearchUserResponseDto,
  })
  async searchUserForFriendshipRequest(
    @Query() searchUserQueryDto: SearchUserQueryDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SearchUserResponseDto> {
    const myId = user.id;
    return await this.friendshipService.searchUserForFriendshipRequest(
      myId,
      searchUserQueryDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('friend-timetable')
  @ApiOperation({
    summary: '친구 시간표 조회',
    description:
      '친구 ID, 연도, 학기를 입력받아 해당 학기에 친구의 대표 시간표를 조회합니다.',
  })
  @ApiQuery({
    name: 'friendId',
    type: 'string',
    required: true,
    description: '친구 ID',
  })
  @ApiQuery({
    name: 'year',
    type: 'string',
    required: true,
    description: '연도',
  })
  @ApiQuery({
    name: 'semester',
    type: 'string',
    required: true,
    description: '학기',
  })
  @ApiOkResponse({
    description: '친구 시간표 반환',
    type: GetTimeTableByTimeTableIdDto,
    isArray: true,
  })
  async getFriendTimeTable(
    @Query() getFriendTimeTableRequestDto: GetFriendTimeTableRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimeTableByTimeTableIdDto> {
    return await this.friendshipService.getFriendTimeTable(
      user.id,
      getFriendTimeTableRequestDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: '친구 요청 보내기',
    description:
      '검색된 유저에게 친구 요청을 보냅니다. friendship 레코드가 새로 생성됩니다.',
  })
  @ApiBody({
    type: SendFriendshipRequestDto,
  })
  @ApiCreatedResponse({
    description: '친구 요청 보내기 성공 시',
    type: SendFriendshipResponseDto,
  })
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
  @ApiOperation({
    summary: '나에게 친구 요청을 보낸 유저 목록 조회',
    description: '나에게 친구 요청을 보낸 유저 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '나에게 친구 요청을 보낸 유저 목록',
    isArray: true,
    type: GetWaitingFriendResponseDto,
  })
  async getWaitingFriendList(
    @User() user: AuthorizedUserDto,
  ): Promise<GetWaitingFriendResponseDto[]> {
    const userId = user.id;
    return await this.friendshipService.getWaitingFriendList(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('received/:friendshipId')
  @ApiOperation({
    summary: '받은 친구 요청 수락하기',
    description:
      'friendshipId를 받아 해당 friendship 레코드의 areWeFriend column을 true로 업데이트합니다.',
  })
  @ApiParam({
    name: 'friendshipId',
    description: '해당 친구 요청에 대한 friendship id',
    type: Number,
  })
  @ApiOkResponse({
    description: '친구 요청 수락 성공 시',
    type: UpdateFriendshipResponseDto,
  })
  async acceptFriendshipRequest(
    @User() user: AuthorizedUserDto,
    @Param('friendshipId') friendshipId: number,
  ): Promise<UpdateFriendshipResponseDto> {
    const userId = user.id;
    return await this.friendshipService.acceptFriendshipRequest(
      userId,
      friendshipId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('received/:friendshipId')
  @ApiOperation({
    summary: '받은 친구 요청 거절하기',
    description: 'friendshipId를 받아 해당 friendship 레코드를 삭제합니다.',
  })
  @ApiParam({
    name: 'friendshipId',
    description: '해당 친구 요청에 대한 friendship id',
    type: Number,
  })
  @ApiOkResponse({
    description: '친구 요청 거절 성공 시',
    type: RejectFriendshipResponseDto,
  })
  async rejectFriendshipRequest(
    @User() user: AuthorizedUserDto,
    @Param('friendshipId') friendshipId: number,
  ): Promise<RejectFriendshipResponseDto> {
    const userId = user.id;
    return await this.friendshipService.rejectFriendshipRequest(
      userId,
      friendshipId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:friendshipId')
  @ApiOperation({
    summary: '친구 삭제하기',
    description:
      '이미 친구로 등록된 유저에 대해, friendshipId를 받아 해당 friendship 레코드를 삭제합니다.',
  })
  @ApiParam({
    name: 'friendshipId',
    description: '해당 친구 관계에 대한 friendship id',
  })
  @ApiOkResponse({
    description: '친구 삭제 성공 시',
    type: DeleteFriendshipResponseDto,
  })
  async deleteFriendship(
    @User() user: AuthorizedUserDto,
    @Param('friendshipId') friendshipId: number,
  ): Promise<DeleteFriendshipResponseDto> {
    const userId = user.id;
    return await this.friendshipService.deleteFriendship(userId, friendshipId);
  }
}
