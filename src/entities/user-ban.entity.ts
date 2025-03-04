import { CommonEntity } from 'src/entities/common.entity';
import { UserEntity } from 'src/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_ban')
export class UserBanEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.userBans, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: UserEntity;

  @Column({ nullable: false })
  bannedAt: Date;

  @Column({ nullable: false })
  expiredAt: Date;

  @Column({ nullable: false })
  reason: string;
}
