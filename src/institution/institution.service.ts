import { Injectable } from '@nestjs/common';
import { GetInstitutionResponseDto } from './dto/get-institution-response-dto';
import { InstitutionRepository } from './institution.repository';
import { CreateInstitutionRequestDto } from './dto/create-insitution-request-dto';

@Injectable()
export class InstitutionService {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async getInstitutionList(): Promise<GetInstitutionResponseDto[]> {
    const institutions = await this.institutionRepository.find();
    return institutions.map((institution) => {
      return new GetInstitutionResponseDto(institution);
    });
  }

  async createInstitution(
    requestDto: CreateInstitutionRequestDto,
  ): Promise<GetInstitutionResponseDto> {
    const { name, category, imgDir, linkUrl } = requestDto;
    const institution = await this.institutionRepository.createInstitution(
      name,
      category,
      imgDir,
      linkUrl,
    );
    return new GetInstitutionResponseDto(institution);
  }
}
