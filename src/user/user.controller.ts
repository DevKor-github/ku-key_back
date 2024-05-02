import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { checkPossibleResponseDto } from './dto/check-possible-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.userService.createUser(createUserDto);
  }

  @Get('check/:username')
  async checkUsernamePossible(
    @Param('username') username: string,
  ): Promise<checkPossibleResponseDto> {
    return await this.userService.checkUsernamePossible(username);
  }

  @Get('check/:email')
  async checkEmailPossible(
    @Param('email') email: string,
  ): Promise<checkPossibleResponseDto> {
    return await this.userService.checkEmailPossible(email);
  }
}
