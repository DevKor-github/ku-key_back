import { FileService } from './../../common/file.service';
import {
  BadRequestException,
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
  constructor(
    private readonly institutionRepository: InstitutionRepository,
    private readonly fileService: FileService,
  ) {}

  async getInstitutionList(): Promise<InstitutionResponseDto[]> {
    const institutions = await this.institutionRepository.find();
    return institutions.map((institution) => {
      const imgDir = this.fileService.makeUrlByFileDir(institution.imgDir);
      return new InstitutionResponseDto(institution, imgDir);
    });
  }

  async createInstitution(
    logoImage: Express.Multer.File,
    requestDto: CreateInstitutionRequestDto,
  ): Promise<InstitutionResponseDto> {
    if (!this.fileService.imagefilter(logoImage)) {
      throw new BadRequestException('Only image file can be uploaded!');
    }

    const { name, category, linkUrl } = requestDto;

    const filename = await this.fileService.uploadFile(
      logoImage,
      'Institution',
      'logo',
    );

    const institution = await this.institutionRepository.createInstitution(
      name,
      category,
      filename,
      linkUrl,
    );

    const imgDir = this.fileService.makeUrlByFileDir(filename);

    return new InstitutionResponseDto(institution, imgDir);
  }

  async updateInstitution(
    institutionId: number,
    logoImage: Express.Multer.File,
    requestDto: UpdateInstitutionRequestDto,
  ): Promise<UpdateInstitutionResponseDto> {
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    });
    if (!institution) {
      throw new NotFoundException('기관 정보를 찾을 수 없습니다');
    }

    const updateData: any = { ...requestDto };
    delete updateData.logoImage;
    let filename: string | null = null;

    if (logoImage) {
      await this.fileService.deleteFile(institution.imgDir);
      filename = await this.fileService.uploadFile(
        logoImage,
        'Institution',
        'logo',
      );
      updateData.imgDir = filename;
    }

    const updated = await this.institutionRepository.update(
      { id: institutionId },
      updateData,
    );

    if (updated.affected === 0) {
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

    await this.fileService.deleteFile(institution.imgDir);

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
