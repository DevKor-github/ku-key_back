import { UserEntity } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async createUser(createUserDto: CreateUserRequestDto): Promise<UserEntity> {
    const user = this.create({ ...createUserDto });
    return await this.save(user);
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.findOne({
      where: { email: email },
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

  async setCurrentRefreshToken(id: number, newRefresthToken: string) {
    const updateResult = await this.update(
      { id: id },
      {
        refreshToken: newRefresthToken,
      },
    );

    return { affected: updateResult?.affected };
  }
}
