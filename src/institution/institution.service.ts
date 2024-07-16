import { Injectable } from '@nestjs/common';
import { GetInstitutionResponseDto } from './dto/get-institution-response-dto';
import { InstitutionRepository } from './institution.repository';

@Injectable()
export class InstitutionService {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async getInstitutionList(): Promise<GetInstitutionResponseDto[]> {
    const institutions = await this.institutionRepository.find();
    return institutions.map((institution) => {
      return new GetInstitutionResponseDto(institution);
    });
  }
}
