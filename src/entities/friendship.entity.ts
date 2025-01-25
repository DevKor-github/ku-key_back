import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';

@Entity('friendship')
export class FriendshipEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  fromUserId: number;

  @Column({ nullable: false })
  toUserId: number;

  @JoinColumn({ name: 'fromUserId' })
  @ManyToOne(() => UserEntity, (user) => user.sentFriendRequests, {
    onDelete: 'CASCADE',
  })
  fromUser: UserEntity;

  @JoinColumn({ name: 'toUserId' })
  @ManyToOne(() => UserEntity, (user) => user.receivedFriendRequests, {
    onDelete: 'CASCADE',
  })
  toUser: UserEntity;

  @Column('boolean', { nullable: false })
  areWeFriend: boolean;

  @Column('boolean', { nullable: false, default: false })
  isRead: boolean;
}
