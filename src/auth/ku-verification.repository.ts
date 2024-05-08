import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { KuVerificationEntity } from 'src/entities/ku-verification.entity';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class KuVerificationRepository extends Repository<KuVerificationEntity> {
  constructor(dataSource: DataSource) {
    super(KuVerificationEntity, dataSource.createEntityManager());
  }

  async createVerificationRequest(
    imgDir: string,
    studentNumber: number,
    user: UserEntity,
  ) {
    const request = this.create({
      imgDir: imgDir,
      studentNumber: studentNumber,
      user: user,
    });
    return await this.save(request);
  }
}
