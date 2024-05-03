import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { checkPossibleResponseDto } from './dto/check-possible-response.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProfileDto } from './dto/profile.dto';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SetProfileResponseDto } from './dto/set-profile-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(
    @Body() createUserDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    return await this.userService.createUser(createUserDto);
  }

  @Get('username/:username')
  async checkUsernamePossible(
    @Param('username') username: string,
  ): Promise<checkPossibleResponseDto> {
    return await this.userService.checkUsernamePossible(username);
  }

  @Get('email/:email')
  async checkEmailPossible(
    @Param('email') email: string,
  ): Promise<checkPossibleResponseDto> {
    return await this.userService.checkEmailPossible(email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile')
  async setProfile(
    @Body() profileDto: ProfileDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetProfileResponseDto> {
    const id = user.id;
    return await this.userService.setProfile(id, profileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@User() user: AuthorizedUserDto): Promise<ProfileDto> {
    const id = user.id;
    return await this.userService.getProfile(id);
  }
}
