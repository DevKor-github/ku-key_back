import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { ClubEntity } from './club.entity';
import { UserEntity } from './user.entity';

@Entity('club_like')
@Index(['club', 'user'], { unique: true })
export class ClubLikeEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => ClubEntity, (club) => club.clubLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clubId' })
  club: ClubEntity;

  @ManyToOne(() => UserEntity, (user) => user.clubLikes, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
