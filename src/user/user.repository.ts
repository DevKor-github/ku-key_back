import { UserEntity } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { Injectable } from '@nestjs/common';
import {
  SetExchangeDayReqeustDto,
  SetProfileRequestDto,
} from './dto/set-profile-request.dto';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async createUser(createUserDto: CreateUserRequestDto): Promise<UserEntity> {
    const user = this.create({ ...createUserDto });
    return await this.save(user);
  }

  async hardDeleteUser(id: number): Promise<boolean> {
    const deleteResult = await this.delete({
      id: id,
    });

    return deleteResult.affected ? true : false;
  }

  async softDeleteUser(id: number): Promise<boolean> {
    const user = await this.findOne({
      where: {
        id: id,
      },
      relations: [
        'kuVerification',
        'sentFriendRequests',
        'receivedFriendRequests',
        'timetables.timetableCourses',
        'timetables.schedules',
        'pointHistories',
        'commentAnonymousNumbers',
        'notices',
      ],
    });
    const deleteResult = await this.softRemove(user);

    return deleteResult.deletedAt ? true : false;
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.findOne({
      where: { email: email },
    });
    return user;
  }

  async findUserByEmailWithDeleted(email: string): Promise<UserEntity> {
    const user = await this.findOne({
      where: { email: email },
      withDeleted: true,
    });
    return user;
  }

  async findUserById(id: number): Promise<UserEntity> {
    const user = await this.findOne({
      where: { id: id },
    });
    return user;
  }

  async findUserByUsername(username: string): Promise<UserEntity> {
    const user = await this.findOne({
      where: { username: username },
    });
    return user;
  }

  async findUserByUsernameWithDeleted(username: string): Promise<UserEntity> {
    const user = await this.findOne({
      where: { username: username },
      withDeleted: true,
    });
    return user;
  }

  async setCurrentRefreshToken(
    id: number,
    newRefresthToken: string,
  ): Promise<boolean> {
    const updateResult = await this.update(
      { id: id },
      {
        refreshToken: newRefresthToken,
      },
    );

    return updateResult.affected ? true : false;
  }

  async setProfile(
    id: number,
    profileDto: SetProfileRequestDto,
  ): Promise<boolean> {
    const updateResult = await this.update({ id: id }, profileDto);

    return updateResult.affected ? true : false;
  }

  async setExchangeDay(
    id: number,
    requestDto: SetExchangeDayReqeustDto,
  ): Promise<boolean> {
    const updateResult = await this.update({ id: id }, requestDto);

    return updateResult.affected ? true : false;
  }

  async verifyUser(id: number, verify: boolean): Promise<boolean> {
    const updateResult = await this.update(
      { id: id },
      {
        isVerified: verify,
      },
    );

    return updateResult.affected ? true : false;
  }

  async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const updateResult = await this.update(
      { id: id },
      { password: newPassword },
    );

    return updateResult.affected ? true : false;
  }
}
