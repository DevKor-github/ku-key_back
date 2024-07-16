import { Controller, Get, UseGuards } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetInstitutionResponseDto } from './dto/get-institution-response-dto';

@Controller('institution')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: '기관 목록 조회',
    description: '전체 기관 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '전체 기관 목록을 배열로 반환합니다.',
    isArray: true,
    type: GetInstitutionResponseDto,
  })
  async getInstitutionList(): Promise<GetInstitutionResponseDto[]> {
    return await this.institutionService.getInstitutionList();
  }
}
