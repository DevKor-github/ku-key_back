import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findUserByEmail(createUserDto.email);
    if (user) {
      throw new BadRequestException('이미 해당 이메일이 존재합니다.');
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    return await this.userRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
  }
}
