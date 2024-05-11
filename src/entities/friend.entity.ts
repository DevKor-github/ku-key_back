import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';

@Entity('friend')
export class FriendEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.sentFriendRequests)
  fromUserId: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.receivedFriendRequests)
  toUserId: UserEntity;

  @Column('tinyint', { nullable: false })
  areWeFriend: boolean;
}
