import { Injectable } from '@nestjs/common';
import { PostImageEntity } from 'src/entities/post-image.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PostImageRepository extends Repository<PostImageEntity> {
  constructor(dataSource: DataSource) {
    super(PostImageEntity, dataSource.createEntityManager());
  }
}
