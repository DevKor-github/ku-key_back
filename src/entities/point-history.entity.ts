import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';

@Entity('point_history')
export class PointHistoryEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column('varchar', { nullable: false })
  history: string;

  @Column('int', { nullable: false })
  changePoint: number;

  @Column('int', { nullable: false })
  resultPoint: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.pointHistories, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
