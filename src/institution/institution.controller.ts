import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { GetInstitutionResponseDto } from './dto/get-institution-response-dto';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { CreateInstitutionRequestDto } from './dto/create-insitution-request-dto';
import { UpdateInstitutionRequestDto } from './dto/update-institution-request-dto';
import { UpdateInstitutionResponseDto } from './dto/update-institution-response-dto';

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

  @UseGuards(AdminAuthGuard)
  @Post()
  @ApiOperation({
    summary: '기관 추가',
    description: 'admin page에서 기관 정보를 추가합니다.',
  })
  @ApiBody({ type: CreateInstitutionRequestDto })
  @ApiCreatedResponse({
    description: '기관 생성 성공',
    type: GetInstitutionResponseDto,
  })
  async createInstitution(
    @Body() body: CreateInstitutionRequestDto,
  ): Promise<GetInstitutionResponseDto> {
    return await this.institutionService.createInstitution(body);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('/:institutionId')
  @ApiOperation({
    summary: '기관 정보 수정',
    description: '기관 id를 받아 admin page에서 기관 정보를 수정합니다.',
  })
  @ApiParam({ name: 'institutionId', description: '기관 id' })
  @ApiBody({ type: UpdateInstitutionRequestDto })
  @ApiOkResponse()
  async updateInstitution(
    @Param('institutionId') institutionId: number,
    @Body() body: UpdateInstitutionRequestDto,
  ): Promise<UpdateInstitutionResponseDto> {
    return await this.institutionService.updateInstitution(institutionId, body);
  }
}
