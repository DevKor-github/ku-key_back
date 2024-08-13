import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InstitutionService } from './institution.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateInstitutionRequestDto } from './dto/create-institution-request-dto';
import { UpdateInstitutionRequestDto } from './dto/update-institution-request-dto';
import { UpdateInstitutionResponseDto } from './dto/update-institution-response-dto';
import { DeleteInstitutionResponseDto } from './dto/delete-institution-response-dto';
import { InstitutionResponseDto } from './dto/institution-response-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @UseInterceptors(FileInterceptor('logoImage'))
  @Post()
  @ApiBearerAuth('accessToken')
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
    @UploadedFile() logoImage: Express.Multer.File,
    @Body() body: CreateInstitutionRequestDto,
  ): Promise<InstitutionResponseDto> {
    return await this.institutionService.createInstitution(logoImage, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @UseInterceptors(FileInterceptor('logoImage'))
  @Patch('/:institutionId')
  @ApiBearerAuth('accessToken')
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
    @UploadedFile() logoImage: Express.Multer.File,
    @Body() body: UpdateInstitutionRequestDto,
  ): Promise<UpdateInstitutionResponseDto> {
    return await this.institutionService.updateInstitution(
      institutionId,
      logoImage,
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete('/:institutionId')
  @ApiBearerAuth('accessToken')
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
