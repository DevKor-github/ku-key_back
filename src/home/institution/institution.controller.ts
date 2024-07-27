import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InstitutionService } from './institution.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { CreateInstitutionRequestDto } from './dto/create-institution-request-dto';
import { UpdateInstitutionRequestDto } from './dto/update-institution-request-dto';
import { UpdateInstitutionResponseDto } from './dto/update-institution-response-dto';
import { DeleteInstitutionResponseDto } from './dto/delete-institution-response-dto';
import { InstitutionResponseDto } from './dto/institution-response-dto';

@Controller('institution')
@ApiTags('institution')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get()
  @ApiOperation({
    summary: '기관 목록 조회',
    description: '전체 기관 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '전체 기관 목록을 배열로 반환합니다.',
    isArray: true,
    type: InstitutionResponseDto,
  })
  async getInstitutionList(): Promise<InstitutionResponseDto[]> {
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
    type: InstitutionResponseDto,
  })
  async createInstitution(
    @Body() body: CreateInstitutionRequestDto,
  ): Promise<InstitutionResponseDto> {
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
  @ApiOkResponse({
    description: '기관 정보 수정 성공',
    type: UpdateInstitutionResponseDto,
  })
  async updateInstitution(
    @Param('institutionId') institutionId: number,
    @Body() body: UpdateInstitutionRequestDto,
  ): Promise<UpdateInstitutionResponseDto> {
    return await this.institutionService.updateInstitution(institutionId, body);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('/:institutionId')
  @ApiOperation({
    summary: '기관 정보 삭제',
    description: '기관 id를 받아 admin page에서 기관 정보를 삭제합니다.',
  })
  @ApiParam({ name: 'institutionId', description: '기관 id' })
  @ApiOkResponse({
    description: '기관 정보 삭제 성공',
    type: DeleteInstitutionResponseDto,
  })
  async deleteInstitution(
    @Param('institutionId') institutionId: number,
  ): Promise<DeleteInstitutionResponseDto> {
    return await this.institutionService.deleteInstitution(institutionId);
  }
}