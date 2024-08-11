import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';
import { Notice } from 'src/notice/enum/notice.enum';

@Entity('notice')
export class NoticeEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column('varchar', { nullable: false })
  content: string;

  @Column('boolean', { default: true })
  isNew: boolean;

  @Column({ type: 'enum', enum: Notice, nullable: false })
  type: Notice;

  @Column('bigint', { nullable: true })
  handler: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.notices, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
