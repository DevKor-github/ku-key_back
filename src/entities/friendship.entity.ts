import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';

@Entity('friendship')
export class FriendshipEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.sentFriendRequests, {
    onDelete: 'CASCADE',
  })
  fromUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.receivedFriendRequests, {
    onDelete: 'CASCADE',
  })
  toUser: UserEntity;

  @Column('boolean', { nullable: false })
  areWeFriend: boolean;
}
