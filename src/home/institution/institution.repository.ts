import { Injectable } from '@nestjs/common';
import { InstitutionEntity } from 'src/entities/institution.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateInstitutionRequestDto } from './dto/update-institution-request-dto';

@Injectable()
export class InstitutionRepository extends Repository<InstitutionEntity> {
  constructor(dataSource: DataSource) {
    super(InstitutionEntity, dataSource.createEntityManager());
  }

  async createInstitution(
    name: string,
    category: string,
    imgDir: string,
    linkUrl: string,
  ): Promise<InstitutionEntity> {
    const institution = this.create({ name, category, imgDir, linkUrl });
    return await this.save(institution);
  }

  async updateInstitution(
    institutionId: number,
    requestDto: UpdateInstitutionRequestDto,
  ): Promise<boolean> {
    const updated = await this.update({ id: institutionId }, requestDto);
    return updated.affected ? true : false;
  }

  async deleteInstitution(institutitonId: number): Promise<boolean> {
    const deleted = await this.softDelete({ id: institutitonId });
    return deleted.affected ? true : false;
  }
}
