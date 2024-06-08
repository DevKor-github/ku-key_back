import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SetProfileResponseDto } from './dto/set-profile-response.dto';
import { SetProfileRequestDto } from './dto/set-profile-request.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

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
    type: SetProfileResponseDto,
  })
  @Patch('/profile')
  async setProfile(
    @Body() profileDto: SetProfileRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetProfileResponseDto> {
    const id = user.id;
    return await this.userService.setProfile(id, profileDto);
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
}
