import { UserEntity } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = this.create({ ...createUserDto });
    return await this.save(user);
  }

  async findUserByEmail(email: string) {
    const user = await this.findOne({
      where: { email: email },
    });
    return user;
  }
}
