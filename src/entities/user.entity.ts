import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('user')
export class UserEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar')
  password: string;

  @Column('varchar')
  homeUniversity: string;

  @Column('varchar')
  language: string;

  @Column('varchar')
  country: string;

  @Column('varchar')
  major: string;

  @Column('varchar')
  gender: string;

  @Column('tinyint', { default: false })
  isVerified: boolean;

  @Column('varchar')
  name: string;

  @Column('timestamp', { nullable: true })
  startDay: Date | null;

  @Column('timestamp', { nullable: true })
  endDay: Date | null;

  @Column('int', { default: 0 })
  point: number;

  @Column('varchar', { nullable: true })
  refreshToken: string | null;
}
