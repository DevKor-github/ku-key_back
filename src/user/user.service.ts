import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { hash, compare } from 'bcrypt';
import * as argon2 from 'argon2';
import { checkPossibleResponseDto } from './dto/check-possible-response.dto';
import { SetResponseDto } from './dto/set-response.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import {
  SetExchangeDayReqeustDto,
  SetProfileRequestDto,
} from './dto/set-profile-request.dto';
import { UserEntity } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { PointHistoryEntity } from 'src/entities/point-history.entity';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { GetPointHistoryResponseDto } from './dto/get-point-history.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    @InjectRepository(PointHistoryEntity)
    private readonly pointHistoryRepository: Repository<PointHistoryEntity>,
  ) {}

  async createUser(createUserDto: CreateUserRequestDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findUserByEmail(
      createUserDto.email,
    );
    if (userByEmail) {
      throw new BadRequestException('이미 해당 이메일이 존재합니다.');
    }

    const userByUsername = await this.userRepository.findUserByUsername(
      createUserDto.username,
    );
    if (userByUsername) {
      throw new BadRequestException('이미 해당 아이디가 존재합니다.');
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    return await this.userRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async deleteUser(userId: number): Promise<void> {
    const isDeleted = await this.userRepository.deleteUser(userId);
    if (!isDeleted) {
      throw new InternalServerErrorException('remove user failed!');
    }
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
    profileDto: SetProfileRequestDto,
  ): Promise<SetResponseDto> {
    const isSet = await this.userRepository.setProfile(id, profileDto);
    if (!isSet) {
      throw new InternalServerErrorException('Profile setting failed!');
    }

    return new SetResponseDto(true);
  }

  async setExchangeDay(
    id: number,
    requestDto: SetExchangeDayReqeustDto,
  ): Promise<SetResponseDto> {
    if (requestDto.startDay >= requestDto.endDay) {
      throw new BadRequestException('StartDay should be earlier than EndDay!');
    }
    const isSet = await this.userRepository.setExchangeDay(id, requestDto);
    if (!isSet) {
      throw new InternalServerErrorException('Exchange Day setting failed!');
    }

    return new SetResponseDto(true);
  }

  async getProfile(id: number): Promise<GetProfileResponseDto> {
    const user = await this.userRepository.findUserById(id);
    const profile: GetProfileResponseDto = {
      name: user.name,
      country: user.country,
      homeUniversity: user.homeUniversity,
      major: user.major,
      startDay: user.startDay,
      endDay: user.endDay,
      point: user.point,
    };
    return profile;
  }

  async checkUserVerified(userId: number): Promise<boolean> {
    const user = await this.userRepository.findUserById(userId);
    return user.isVerified;
  }

  async setCurrentRefresthToken(
    id: number,
    refreshToken?: string,
  ): Promise<boolean> {
    if (refreshToken === null) {
      return await this.userRepository.setCurrentRefreshToken(id, refreshToken);
    }

    const hashedToken = await argon2.hash(refreshToken);

    return await this.userRepository.setCurrentRefreshToken(id, hashedToken);
  }

  async verifyUser(userId: number, verify: boolean): Promise<boolean> {
    return await this.userRepository.verifyUser(userId, verify);
  }

  async findUserById(userId: number): Promise<UserEntity> {
    return await this.userRepository.findUserById(userId);
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findUserByEmail(email);
  }
  async findUserByUsername(username: string): Promise<UserEntity> {
    return await this.userRepository.findUserByUsername(username);
  }

  async updatePassword(userId: number, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findUserById(userId);
    const isSame = await compare(newPassword, user.password);
    if (isSame) {
      throw new BadRequestException('Same Password!');
    }
    const hashedPassword = await hash(newPassword, 10);
    return await this.userRepository.updatePassword(userId, hashedPassword);
  }

  async changePoint(
    userId: number,
    changePoint: number,
    history: string,
  ): Promise<number> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException('Wrong userId!');
    }
    const originPoint = user.point;
    if (originPoint + changePoint < 0) {
      throw new BadRequestException("Don't have enough point!");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      user.point = originPoint + changePoint;
      await queryRunner.manager.save(user);

      const newHistory = queryRunner.manager.create(PointHistoryEntity, {
        userId: userId,
        history: history,
        changePoint: changePoint,
        resultPoint: user.point,
      });
      await queryRunner.manager.save(newHistory);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return user.point;
  }

  async getPointHistory(
    user: AuthorizedUserDto,
  ): Promise<GetPointHistoryResponseDto[]> {
    const histories = await this.pointHistoryRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    return histories.map((history) => new GetPointHistoryResponseDto(history));
  }
}
