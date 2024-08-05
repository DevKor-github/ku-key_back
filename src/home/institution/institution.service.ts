import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InstitutionRepository } from './institution.repository';
import { CreateInstitutionRequestDto } from './dto/create-institution-request-dto';
import { UpdateInstitutionRequestDto } from './dto/update-institution-request-dto';
import { UpdateInstitutionResponseDto } from './dto/update-institution-response-dto';
import { DeleteInstitutionResponseDto } from './dto/delete-institution-response-dto';
import { InstitutionResponseDto } from './dto/institution-response-dto';

@Injectable()
export class InstitutionService {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async getInstitutionList(): Promise<InstitutionResponseDto[]> {
    const institutions = await this.institutionRepository.find();
    return institutions.map((institution) => {
      return new InstitutionResponseDto(institution);
    });
  }

  async createInstitution(
    requestDto: CreateInstitutionRequestDto,
  ): Promise<InstitutionResponseDto> {
    const { name, category, imgDir, linkUrl } = requestDto;
    const institution = await this.institutionRepository.createInstitution(
      name,
      category,
      imgDir,
      linkUrl,
    );
    return new InstitutionResponseDto(institution);
  }

  async updateInstitution(
    institutionId: number,
    requestDto: UpdateInstitutionRequestDto,
  ): Promise<UpdateInstitutionResponseDto> {
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    });
    if (!institution) {
      throw new NotFoundException('기관 정보를 찾을 수 없습니다');
    }

    const isUpdated = await this.institutionRepository.updateInstitution(
      institutionId,
      requestDto,
    );
    if (!isUpdated) {
      throw new InternalServerErrorException('업데이트에 실패했습니다.');
    }
    return new UpdateInstitutionResponseDto(true);
  }

  async deleteInstitution(
    institutionId: number,
  ): Promise<DeleteInstitutionResponseDto> {
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    });
    if (!institution) {
      throw new NotFoundException('기관 정보를 찾을 수 없습니다.');
    }

    const idDeleted =
      await this.institutionRepository.deleteInstitution(institutionId);
    if (!idDeleted) {
      throw new InternalServerErrorException(
        '기관 정보를 삭제하는데 실패했습니다.',
      );
    }
    return new DeleteInstitutionResponseDto(true);
  }
}
