import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SetProfileResponseDto } from './dto/set-profile-response.dto';
import { SetProfileRequestDto } from './dto/set-profile-request.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('/profile')
  async setProfile(
    @Body() profileDto: SetProfileRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetProfileResponseDto> {
    const id = user.id;
    return await this.userService.setProfile(id, profileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(
    @User() user: AuthorizedUserDto,
  ): Promise<GetProfileResponseDto> {
    const id = user.id;
    return await this.userService.getProfile(id);
  }
}
