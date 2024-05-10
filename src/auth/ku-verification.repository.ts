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
    });
    return requests;
  }

  async findRequestByUser(user: UserEntity): Promise<KuVerificationEntity> {
    const request = await this.findOne({
      where: { user: { id: user.id } },
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

  async modifyVerificationRequest(
    originReqeust: KuVerificationEntity,
    imgDir: string,
    studentNumber: number,
    user: UserEntity,
  ): Promise<boolean> {
    const updateResult = await this.update(
      { id: originReqeust.id, user: user },
      {
        imgDir: imgDir,
        studentNumber: studentNumber,
      },
    );
    return updateResult.affected ? true : false;
  }
}
