import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('institution')
export class InstitutionEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { nullable: false })
  name: string;

  @Column('varchar', { nullable: false })
  category: string;

  @Column('varchar', { nullable: false })
  imgDir: string;

  @Column('varchar', { nullable: false })
  linkUrl: string;
}
