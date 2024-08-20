import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { ClubLikeEntity } from './club-like.entity';

@Entity('club')
export class ClubEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  summary: string;

  @Column({ type: 'varchar', nullable: false })
  category: string;

  @Column({ type: 'varchar', nullable: false })
  regularMeeting: string;

  @Column({ type: 'varchar', nullable: false })
  recruitmentPeriod: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @OneToMany(() => ClubLikeEntity, (clubLike) => clubLike.club)
  clubLikes: ClubLikeEntity[];

  @Column({ default: 0 })
  allLikes: number;

  @Column({ type: 'varchar', nullable: false })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  instagramLink: string;

  @Column({ type: 'varchar', nullable: true })
  youtubeLink: string;
}
