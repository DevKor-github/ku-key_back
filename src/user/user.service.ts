import {
  BadRequestException,
  ConflictException,
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
import { EntityManager, Repository } from 'typeorm';
import { DeleteUserResponseDto } from './dto/delete-user.dto';
import { CharacterEntity } from 'src/entities/character.entity';
import { CharacterType } from 'src/enums/character-type.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(CharacterEntity)
    private readonly characterRepository: Repository<CharacterEntity>,
  ) {}

  async createUser(
    transactionManager: EntityManager,
    createUserDto: CreateUserRequestDto,
  ): Promise<UserEntity> {
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
    const defaultExpireDate = this.generateDefaultExpiredate();

    const user = transactionManager.create(UserEntity, {
      ...createUserDto,
      password: hashedPassword,
      viewableUntil: defaultExpireDate,
    });

    return await transactionManager.save(user);
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
    const user = await this.userRepository.findUserById(id);
    const character = await this.characterRepository.findOne({
      where: { userId: id },
    });
    return new GetProfileResponseDto(user, character);
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

  async createUserCharacter(
    tranasactionManager: EntityManager,
    userId: number,
  ): Promise<CharacterEntity> {
    const existingCharacter = await this.characterRepository.findOne({
      where: { userId: userId },
    });
    if (existingCharacter) {
      throw new ConflictException('이미 캐릭터가 존재합니다.');
    }
    const character = tranasactionManager.create(CharacterEntity, {
      userId: userId,
      level: 1,
      type: this.getRandomCharacterType(),
    });

    return await tranasactionManager.save(character);
  }

  async updateViewableUntil(
    transactionManager: EntityManager,
    user: UserEntity,
    daysToAdd: number,
  ): Promise<Date> {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨드 값
    const koreaTime = new Date(Date.now() + offset); // 현재 시간
    let newExpireDate: Date;

    if (user.viewableUntil < koreaTime) {
      newExpireDate = koreaTime;
    } else {
      newExpireDate = user.viewableUntil;
    }
    newExpireDate.setDate(newExpireDate.getDate() + daysToAdd);

    const updated = await transactionManager.update(
      UserEntity,
      { id: user.id },
      { viewableUntil: newExpireDate },
    );

    if (updated.affected === 0) {
      throw new InternalServerErrorException('업데이트에 실패했습니다.');
    }

    return newExpireDate;
  }

  async upgradeUserCharacter(
    transactionManager: EntityManager,
    userCharacter: CharacterEntity,
  ): Promise<number> {
    if (userCharacter.level === 6) {
      throw new BadRequestException('최대 레벨입니다.');
    }

    const updated = await transactionManager.update(
      CharacterEntity,
      { id: userCharacter.id },
      { level: userCharacter.level + 1 },
    );

    if (updated.affected === 0) {
      throw new InternalServerErrorException('업데이트에 실패했습니다.');
    }

    return userCharacter.level + 1;
  }

  async changeUserCharacterType(
    transactionManager: EntityManager,
    userCharacter: CharacterEntity,
  ): Promise<CharacterType> {
    const newType = this.getRandomCharacterType(userCharacter.type);

    const updated = await transactionManager.update(
      CharacterEntity,
      { id: userCharacter.id },
      { type: newType },
    );

    if (updated.affected === 0) {
      throw new InternalServerErrorException('업데이트에 실패했습니다.');
    }

    return newType;
  }

  private getRandomCharacterType(existingType?: CharacterType): CharacterType {
    const characterTypes = Object.values(CharacterType);
    if (existingType) {
      // 기존 타입을 제외한 나머지에서 랜덤 선택
      const availableTypes = characterTypes.filter(
        (type) => type !== existingType,
      );
      const randomIndex = Math.floor(Math.random() * availableTypes.length);
      return availableTypes[randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * characterTypes.length);
      return characterTypes[randomIndex];
    }
  }

  private generateDefaultExpiredate(): Date {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨드 값
    const expireDate = new Date(Date.now() + offset);
    expireDate.setDate(expireDate.getDate() + 3);

    return expireDate;
  }
}
