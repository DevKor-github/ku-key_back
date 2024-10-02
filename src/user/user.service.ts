import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { hash, compare } from 'bcrypt';
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
import { Language } from 'src/enums/language';
import { UserLanguageEntity } from 'src/entities/user-language.entity';
import { LanguageResponseDto } from './dto/user-language.dto';
import { CheckCourseReviewReadingTicketResponseDto } from './dto/check-course-review-reading-ticket.dto';
import { SelectCharacterLevelRequestDto } from './dto/select-character-level-request.dto';
import { SelectCharacterLevelResponseDto } from './dto/select-character-level-response-dto';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(CharacterEntity)
    private readonly characterRepository: Repository<CharacterEntity>,
    @InjectRepository(UserLanguageEntity)
    private readonly userLanguageRepository: Repository<UserLanguageEntity>,
  ) {}

  async createUser(
    transactionManager: EntityManager,
    createUserDto: CreateUserRequestDto,
  ): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findUserByEmail(
      createUserDto.email,
    );
    if (userByEmail) {
      throwKukeyException('EMAIL_ALREADY_USED');
    }

    const userByUsername = await this.userRepository.findUserByUsername(
      createUserDto.username,
    );
    if (userByUsername) {
      throwKukeyException('USERNAME_ALREADY_USED');
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
      throwKukeyException('USER_DELETE_FAILED');
    }

    return isDeleted;
  }

  async softDeleteUser(userId: number): Promise<DeleteUserResponseDto> {
    const isDeleted = await this.userRepository.softDeleteUser(userId);
    if (!isDeleted) {
      throwKukeyException('USER_DELETE_FAILED');
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
      throwKukeyException('RE_REGISTRATION_NOT_ALLOWED');
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
      throwKukeyException('PROFILE_UPDATE_FAILED');
    }

    return new SetResponseDto(true);
  }

  async setExchangeDay(
    id: number,
    requestDto: SetExchangeDayReqeustDto,
  ): Promise<SetResponseDto> {
    if (requestDto.startDay >= requestDto.endDay) {
      throwKukeyException('INVALID_DATE_RANGE');
    }
    const isSet = await this.userRepository.setExchangeDay(id, requestDto);
    if (!isSet) {
      throwKukeyException('EXCHANGE_DAY_UPDATE_FAILED');
    }

    return new SetResponseDto(true);
  }

  async getProfile(id: number): Promise<GetProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { userLanguages: true },
    });
    const character = await this.characterRepository.findOne({
      where: { userId: id },
    });
    return new GetProfileResponseDto(user, character);
  }

  async checkUserVerified(userId: number): Promise<boolean> {
    const user = await this.userRepository.findUserById(userId);
    return user.isVerified;
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
      throwKukeyException('SAME_PASSWORD');
    }
    const hashedPassword = await hash(newPassword, 10);
    const updated = await this.userRepository.updatePassword(
      userId,
      hashedPassword,
    );

    if (!updated) {
      throwKukeyException('PASSWORD_UPDATE_FAILED');
    }

    return true;
  }

  async isPasswordMatched(userId: number, password: string): Promise<boolean> {
    const user = await this.userRepository.findUserById(userId);
    return await compare(password, user.password);
  }

  async createUserCharacter(
    tranasactionManager: EntityManager,
    userId: number,
  ): Promise<CharacterEntity> {
    const existingCharacter = await this.characterRepository.findOne({
      where: { userId: userId },
    });
    if (existingCharacter) {
      throwKukeyException('CHARACTER_ALREADY_EXIST');
    }
    const character = tranasactionManager.create(CharacterEntity, {
      userId: userId,
      level: 1,
      type: this.getRandomCharacterType(),
    });

    return await tranasactionManager.save(character);
  }

  async findCharacterByUserId(userId: number): Promise<CharacterEntity> {
    return await this.characterRepository.findOne({
      where: { userId: userId },
    });
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
      throwKukeyException('VIEWABLE_UNTIL_UPDATE_FAILED');
    }

    return newExpireDate;
  }

  async upgradeUserCharacter(
    transactionManager: EntityManager,
    userCharacter: CharacterEntity,
  ): Promise<number> {
    if (userCharacter.level === 6) {
      throwKukeyException('CHARACTER_LEVEL_ALREADY_MAX');
    }

    const updated = await transactionManager.update(
      CharacterEntity,
      { id: userCharacter.id },
      {
        level: userCharacter.level + 1,
        selectedLevel: userCharacter.level + 1,
      },
    );

    if (updated.affected === 0) {
      throwKukeyException('CHARACTER_LEVEL_UPGRADE_FAILED');
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
      throwKukeyException('CHARACTER_TYPE_CHANGE_FAILED');
    }

    return newType;
  }

  private getRandomCharacterType(existingType?: CharacterType): CharacterType {
    const excludedTypes = [CharacterType.anonymous, CharacterType.deleted];
    if (existingType) excludedTypes.push(existingType);

    // 기존 타입을 제외한 나머지에서 랜덤 선택
    const availableTypes = Object.values(CharacterType).filter(
      (type) => !excludedTypes.includes(type),
    );

    const randomIndex = Math.floor(Math.random() * availableTypes.length);
    return availableTypes[randomIndex];
  }

  private generateDefaultExpiredate(): Date {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨드 값
    const expireDate = new Date(Date.now() + offset);
    expireDate.setDate(expireDate.getDate() + 3);

    return expireDate;
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

    if (!user) throwKukeyException('USER_NOT_FOUND');

    if (user.userLanguages.length >= 5)
      throwKukeyException('LANGUAGE_LIMIT_EXCEEDED');

    if (
      user.userLanguages.some(
        (userLanguage) => userLanguage.language === language,
      )
    )
      throwKukeyException('LANGUAGE_ALREADY_EXIST');

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

    if (!user) throwKukeyException('USER_NOT_FOUND');

    const existingLanguage = user.userLanguages.find(
      (userLanguage) => userLanguage.language === language,
    );
    if (!existingLanguage) throwKukeyException('LANGUAGE_NOT_FOUND');

    if (
      !(
        await this.userLanguageRepository.delete({
          id: existingLanguage.id,
        })
      ).affected
    )
      throwKukeyException('LANGUAGE_DELETE_FAILED');

    const allLanguage = user.userLanguages
      .filter((userLanguage) => userLanguage.language !== language)
      .map((userLanguage) => userLanguage.language);

    const result: LanguageResponseDto = {
      languages: allLanguage,
    };

    return result;
  }

  async checkCourseReviewReadingTicket(
    userId: number,
  ): Promise<CheckCourseReviewReadingTicketResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) throwKukeyException('USER_NOT_FOUND');

    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨드 값
    const koreaTime = new Date(Date.now() + offset); // 현재 시간

    if (user.viewableUntil <= koreaTime) {
      // 강의평 열람기간이 같을때도 만료되었다고 처리
      return null;
    }

    return new CheckCourseReviewReadingTicketResponseDto(user.viewableUntil);
  }

  async selectCharacterLevel(
    userId: number,
    requestDto: SelectCharacterLevelRequestDto,
  ): Promise<SelectCharacterLevelResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['character'],
    });

    if (!user) throwKukeyException('USER_NOT_FOUND');

    const { selectedLevel } = requestDto;
    if (selectedLevel > user.character.level)
      throwKukeyException('CHARACTER_LEVEL_NOT_UNLOCKED');

    const updated = await this.characterRepository.update(user.character.id, {
      selectedLevel,
    });

    if (updated.affected === 0) {
      throwKukeyException('CHARACTER_LEVEL_SELECT_FAILED');
    }

    return new SelectCharacterLevelResponseDto(selectedLevel);
  }
}
