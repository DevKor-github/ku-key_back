import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PointHistoryEntity } from 'src/entities/point-history.entity';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { GetPointHistoryResponseDto } from './dto/get-point-history.dto';
import { DeleteUserResponseDto } from './dto/delete-user.dto';
import { Language } from 'src/enums/language';
import { UserLanguageEntity } from 'src/entities/user-language.entity';
import { LanguageResponseDto } from './dto/user-language.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    @InjectRepository(PointHistoryEntity)
    private readonly pointHistoryRepository: Repository<PointHistoryEntity>,
    @InjectRepository(UserLanguageEntity)
    private readonly userLanguageRepository: Repository<UserLanguageEntity>,
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

  async hardDeleteUser(userId: number): Promise<boolean> {
    const isDeleted = await this.userRepository.hardDeleteUser(userId);
    if (!isDeleted) {
      throw new InternalServerErrorException('remove user failed!');
    }

    return isDeleted;
  }

  async softDeleteUser(userId: number): Promise<DeleteUserResponseDto> {
    const isDeleted = await this.userRepository.softDeleteUser(userId);
    if (!isDeleted) {
      throw new InternalServerErrorException('remove user failed!');
    }

    return new DeleteUserResponseDto(isDeleted);
  }

  async checkUsernamePossible(
    username: string,
  ): Promise<checkPossibleResponseDto> {
    const user =
      await this.userRepository.findUserByUsernameWithDeleted(username);
    if (!user) {
      return new checkPossibleResponseDto(true);
    } else {
      return new checkPossibleResponseDto(false);
    }
  }

  async checkEmailPossible(email: string): Promise<checkPossibleResponseDto> {
    const user = await this.userRepository.findUserByEmailWithDeleted(email);

    if (!user) {
      return new checkPossibleResponseDto(true);
    } else if (!user.deletedAt) {
      return new checkPossibleResponseDto(false);
    } else if (
      user.deletedAt.getTime() >
      new Date().getTime() - 1000 * 60 * 60 * 24 * 7
    ) {
      throw new BadRequestException(
        'Re-registration is not possible within 7 days of withdrawal.',
      );
    } else {
      await this.hardDeleteUser(user.id);
      return new checkPossibleResponseDto(true);
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
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { userLanguages: true },
    });
    const profile: GetProfileResponseDto = {
      name: user.name,
      country: user.country,
      homeUniversity: user.homeUniversity,
      major: user.major,
      startDay: user.startDay,
      endDay: user.endDay,
      point: user.point,
      languages: user.userLanguages.map(
        (userLanguage) => userLanguage.language,
      ),
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
    transactionManager: EntityManager,
  ): Promise<number> {
    const user = await transactionManager.findOne(UserEntity, {
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Wrong userId!');
    }
    const originPoint = user.point;
    if (originPoint + changePoint < 0) {
      throw new BadRequestException("Don't have enough point!");
    }

    user.point = originPoint + changePoint;
    await transactionManager.save(user);

    const newHistory = transactionManager.create(PointHistoryEntity, {
      userId: userId,
      history: history,
      changePoint: changePoint,
      resultPoint: user.point,
    });
    await transactionManager.save(newHistory);
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

  async appendLanguage(
    userId: number,
    language: Language,
  ): Promise<LanguageResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        userLanguages: true,
      },
    });

    if (!user) throw new BadRequestException('Wrong userId!');

    if (user.userLanguages.length >= 5)
      throw new BadRequestException('Can Only append up to 5 language!');

    if (
      user.userLanguages.some(
        (userLanguage) => userLanguage.language === language,
      )
    )
      throw new ConflictException('Existing Language!');

    const newLanguage = this.userLanguageRepository.create({
      userId,
      language,
    });
    await this.userLanguageRepository.save(newLanguage);

    const allLanguage = user.userLanguages.map(
      (userLanguage) => userLanguage.language,
    );
    allLanguage.push(language);

    const result: LanguageResponseDto = {
      languages: allLanguage,
    };

    return result;
  }

  async deleteLanguage(
    userId: number,
    language: Language,
  ): Promise<LanguageResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        userLanguages: true,
      },
    });

    if (!user) throw new BadRequestException('Wrong userId!');

    const existingLanguage = user.userLanguages.find(
      (userLanguage) => userLanguage.language === language,
    );
    if (!existingLanguage)
      throw new NotFoundException(`There's no ${language}`);

    if (
      !(
        await this.userLanguageRepository.delete({
          id: existingLanguage.id,
        })
      ).affected
    )
      throw new InternalServerErrorException('Delete failed!');

    const allLanguage = user.userLanguages
      .filter((userLanguage) => userLanguage.language !== language)
      .map((userLanguage) => userLanguage.language);

    const result: LanguageResponseDto = {
      languages: allLanguage,
    };

    return result;
  }
}
