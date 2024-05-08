import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';

@Entity('ku_verification')
export class KuVerificationEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar')
  imgDir: string;

  @Column('int', { unique: true })
  studentNumber: number;

  @OneToOne(() => UserEntity, (user) => user.kuVerification)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserEntity;
}