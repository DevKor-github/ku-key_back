import { Module } from '@nestjs/common';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { FriendshipEntity } from 'src/entities/friendship.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipRepository } from './friendship.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FriendshipEntity])],
  controllers: [FriendshipController],
  providers: [FriendshipService, FriendshipRepository, UserRepository],
})
export class FriendshipModule {}
