import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('user')
export class UserEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { unique: true })
  username: string;

  @Column('varchar')
  password: string;

  @Column('varchar', { nullable: true })
  homeUniversity: string | null;

  @Column('varchar', { nullable: true })
  language: string | null;

  @Column('varchar', { nullable: true })
  country: string | null;

  @Column('varchar', { nullable: true })
  major: string | null;

  @Column('varchar', { nullable: true })
  gender: string | null;

  @Column('tinyint', { default: false })
  isVerified: boolean;

  @Column('varchar', { nullable: true })
  name: string | null;

  @Column('timestamp', { nullable: true })
  startDay: Date | null;

  @Column('timestamp', { nullable: true })
  endDay: Date | null;

  @Column('int', { default: 0 })
  point: number;

  @Column('varchar', { nullable: true })
  refreshToken: string | null;
}
