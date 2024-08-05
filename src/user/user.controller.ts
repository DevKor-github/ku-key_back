import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SetResponseDto } from './dto/set-response.dto';
import {
  SetExchangeDayReqeustDto,
  SetProfileRequestDto,
} from './dto/set-profile-request.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetPointHistoryResponseDto } from './dto/get-point-history.dto';
import { DeleteUserResponseDto } from './dto/delete-user.dto';

@ApiTags('User')
@ApiBearerAuth('accessToken')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '프로필 설정',
    description: '프로필을 설정(변경) 합니다',
  })
  @ApiBody({
    type: SetProfileRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '프로필 설정 성공',
    type: SetResponseDto,
  })
  @Patch('/profile')
  async setProfile(
    @Body() profileDto: SetProfileRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetResponseDto> {
    const id = user.id;
    return await this.userService.setProfile(id, profileDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '교환 남은 일자 설정',
    description: '교환학생 남은 일자를 설정(변경) 합니다',
  })
  @ApiBody({
    type: SetExchangeDayReqeustDto,
  })
  @ApiResponse({
    status: 200,
    description: '교환 남은 일자 설정 성공',
    type: SetResponseDto,
  })
  @Patch('/exchange-day')
  async setExchangeDay(
    @Body() requestDto: SetExchangeDayReqeustDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetResponseDto> {
    const id = user.id;
    return await this.userService.setExchangeDay(id, requestDto);
  }

  @ApiOperation({
    summary: '프로필 조회',
    description: '프로필을 조회 합니다',
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: GetProfileResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(
    @User() user: AuthorizedUserDto,
  ): Promise<GetProfileResponseDto> {
    const id = user.id;
    return await this.userService.getProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('point')
  async changePoint(@User() user: AuthorizedUserDto): Promise<number> {
    const id = user.id;
    return await this.userService.changePoint(id, -100, '포인트 획득');
  }

  @ApiOperation({
    summary: '포인트 내역 조회',
    description: '포인트 획득/사용 내역을 조회 합니다',
  })
  @ApiResponse({
    status: 200,
    description: '포인트 내역 조회 성공',
    type: [GetPointHistoryResponseDto],
  })
  @UseGuards(JwtAuthGuard)
  @Get('point-history')
  async getPointHistory(
    @User() user: AuthorizedUserDto,
  ): Promise<GetPointHistoryResponseDto[]> {
    return await this.userService.getPointHistory(user);
  }

  @ApiOperation({
    summary: '회원탈퇴',
    description: '사용자의 계정을 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '회원탈퇴 성공',
    type: DeleteUserResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(
    @User() user: AuthorizedUserDto,
  ): Promise<DeleteUserResponseDto> {
    return this.userService.softDeleteUser(user.id);
  }
}
