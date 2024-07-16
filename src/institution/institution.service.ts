import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetInstitutionResponseDto } from './dto/get-institution-response-dto';
import { InstitutionRepository } from './institution.repository';
import { CreateInstitutionRequestDto } from './dto/create-insitution-request-dto';
import { UpdateInstitutionRequestDto } from './dto/update-institution-request-dto';
import { UpdateInstitutionResponseDto } from './dto/update-institution-response-dto';

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

  async updateInstitution(
    institutionId: number,
    requestDto: UpdateInstitutionRequestDto,
  ): Promise<UpdateInstitutionResponseDto> {
    const isUpdated = await this.institutionRepository.updateInstitution(
      institutionId,
      requestDto,
    );
    if (!isUpdated) {
      throw new InternalServerErrorException('업데이트에 실패했습니다.');
    }
    return new UpdateInstitutionResponseDto(true);
  }
}
