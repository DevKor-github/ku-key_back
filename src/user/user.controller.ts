import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { checkPossibleResponseDto } from './dto/check-possible-response.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';

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
}
