import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CalenderService } from './calender.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetCalenderDataResponseDto } from './dto/get-calender-data-response-dto';
import { GetCalenderDataQueryDto } from './dto/get-calender-data-query-dto';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { CreateCalenderDataRequestDto } from './dto/create-calender-data-request.dto';

@Controller('calender')
@ApiTags('calender')
@ApiBearerAuth('accessToken')
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: '특정 날짜 행사/일정 조회',
    description: '날짜를 받아 그 날짜의 행사/일정을 조회합니다.',
  })
  @ApiQuery({ name: 'date', required: true, description: '날짜' })
  @ApiOkResponse({
    description: '특정 날짜의 행사/일정 데이터 반환',
    type: GetCalenderDataResponseDto,
  })
  async getCalenderData(
    @Query() queryDto: GetCalenderDataQueryDto,
  ): Promise<GetCalenderDataResponseDto> {
    return await this.calenderService.getCalenderData(queryDto.date);
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  @ApiOperation({
    summary: '특정 날짜 행사/일정 생성',
    description: '특정 날짜의 행사/일정을 생성합니다.',
  })
  @ApiBody({ type: CreateCalenderDataRequestDto })
  @ApiCreatedResponse({
    description: '행사/일정 생성 성공',
    type: GetCalenderDataResponseDto,
  })
  async createCalenderData(@Body() body: CreateCalenderDataRequestDto) {
    return await this.calenderService.createCalenderData(body);
  }
}
