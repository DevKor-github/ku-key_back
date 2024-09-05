import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';
import { CharacterType } from 'src/enums/character-type.enum';

@Entity('character')
export class CharacterEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column('int', { nullable: false })
  level: number;

  @Column('int', { nullable: true, default: null })
  selectLevel: number;

  @Column({ type: 'enum', enum: CharacterType, nullable: false })
  type: CharacterType;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
