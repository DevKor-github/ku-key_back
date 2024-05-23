import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { checkPossibleResponseDto } from './dto/check-possible-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SetProfileResponseDto } from './dto/set-profile-response.dto';
import { SetProfileRequestDto } from './dto/set-profile-request.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('username/:username')
  async checkUsernamePossible(
    @Param('username') username: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<checkPossibleResponseDto> {
    const responseDto = await this.userService.checkUsernamePossible(username);
    const code = responseDto.possible ? 200 : 403;
    res.status(code);
    return responseDto;
  }

  @Post('email/:email')
  async checkEmailPossible(
    @Param('email') email: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<checkPossibleResponseDto> {
    const responseDto = await this.userService.checkEmailPossible(email);
    const code = responseDto.possible ? 200 : 403;
    res.status(code);
    return responseDto;
  }

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
