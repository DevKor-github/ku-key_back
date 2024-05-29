import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { KuVerificationEntity } from 'src/entities/ku-verification.entity';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class KuVerificationRepository extends Repository<KuVerificationEntity> {
  constructor(dataSource: DataSource) {
    super(KuVerificationEntity, dataSource.createEntityManager());
  }

  async findRequestsByStudentNumber(
    studentNumber: number,
  ): Promise<KuVerificationEntity[]> {
    const requests = await this.find({
      where: { studentNumber: studentNumber },
      relations: ['user'],
    });
    return requests;
  }

  async findRequestById(id: number): Promise<KuVerificationEntity> {
    const request = await this.findOne({
      where: { id: id },
      relations: ['user'],
    });
    return request;
  }

  async createVerificationRequest(
    imgDir: string,
    studentNumber: number,
    user: UserEntity,
  ): Promise<KuVerificationEntity> {
    const newRequest = this.create({
      imgDir: imgDir,
      studentNumber: studentNumber,
      user: user,
    });
    return await this.save(newRequest);
  }

  async getRequests(): Promise<KuVerificationEntity[]> {
    const requests = await this.find({
      relations: ['user'],
    });
    return requests;
  }
}
