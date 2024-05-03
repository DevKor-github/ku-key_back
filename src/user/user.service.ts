import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { hash } from 'bcrypt';
import { checkPossibleResponseDto } from './dto/check-possible-response.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { ProfileDto } from './dto/profile.dto';
import { SetProfileResponseDto } from './dto/set-profile-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(
    createUserDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.userRepository.findUserByEmail(createUserDto.email);
    if (user) {
      throw new BadRequestException('이미 해당 이메일이 존재합니다.');
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    await this.userRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    return new CreateUserResponseDto(true);
  }

  async checkUsernamePossible(
    username: string,
  ): Promise<checkPossibleResponseDto> {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) {
      return new checkPossibleResponseDto(true);
    } else {
      return new checkPossibleResponseDto(false);
    }
  }

  async checkEmailPossible(email: string): Promise<checkPossibleResponseDto> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      return new checkPossibleResponseDto(true);
    } else {
      return new checkPossibleResponseDto(false);
    }
  }

  async setProfile(
    id: number,
    profileDto: ProfileDto,
  ): Promise<SetProfileResponseDto> {
    const isset = await this.userRepository.setProfile(id, profileDto);
    if (!isset) {
      throw new NotImplementedException('Profile setting failed!');
    }

    return new SetProfileResponseDto(true);
  }

  async getProfile(id: number): Promise<ProfileDto> {
    const user = await this.userRepository.findUserById(id);
    const profile: ProfileDto = {
      name: user.name,
      country: user.country,
      homeUniversity: user.homeUniversity,
      language: user.language,
      major: user.major,
      startDay: user.startDay,
      endDay: user.endDay,
    };
    return profile;
  }
}
