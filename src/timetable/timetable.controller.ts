import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TimetableDto } from './dto/timetable.dto';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { GetTimetableByUserIdResponseDto } from './dto/userId-timetable.dto';
import { UpdateTimetableNameDto } from './dto/update-timetable-name.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTimetableCourseResponseDto } from './dto/create-timetable-course-response.dto';
import { CommonTimetableResponseDto } from './dto/common-timetable-response.dto';
import { CommonDeleteResponseDto } from './dto/common-delete-response.dto';
import { GetTimetableByTimetableIdDto } from './dto/get-timetable-timetable.dto';
import { UpdateTimetableColorDto } from './dto/update-timetable-color.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';

@Controller('timetable')
@ApiTags('timetable')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard) // 시간표 관련 API는 인증 필요해서 JwtAuthGuard 사용
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  // timetable 에 course 추가 (존재하는 강의가 있을 때 추가하지 못하도록)
  @Post('course')
  @ApiOperation({
    summary: '시간표에 강의 추가',
    description:
      '시간표에 특정 강의를 추가합니다. 해당 시간에 이미 등록된 개인 스케쥴이나 강의가 있을 경우 추가되지 않습니다.',
  })
  @ApiQuery({
    name: 'timetableId',
    type: 'number',
    required: true,
    description: '특정 시간표 ID',
  })
  @ApiQuery({
    name: 'courseId',
    type: 'number',
    required: true,
    description: '추가할 강의 ID',
  })
  @ApiResponse({
    status: 201,
    description: '강의 추가 성공 시',
    type: CreateTimetableCourseResponseDto,
  })
  async createTimetableCourse(
    @Query('timetableId') timetableId: number,
    @Query('courseId') courseId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<CreateTimetableCourseResponseDto> {
    return await this.timetableService.createTimetableCourse(
      timetableId,
      courseId,
      user,
    );
  }

  // 시간표 생성 (시간표 틀)
  @Post()
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '시간표 생성',
    description:
      '해당 연도, 학기에 시간표를 생성합니다. 처음 만들어진 시간표가 대표시간표가 되며, 한 학기에 최대 3개까지 시간표 생성이 가능합니다.',
  })
  @ApiBody({
    type: CreateTimetableDto,
  })
  @ApiResponse({
    status: 201,
    description: '시간표 생성 성공 시',
    type: CommonTimetableResponseDto,
  })
  async createTimetable(
    @TransactionManager() transactionManager: EntityManager,
    @Body() createTimetableDto: CreateTimetableDto,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonTimetableResponseDto> {
    return await this.timetableService.createTimetable(
      transactionManager,
      createTimetableDto,
      user,
    );
  }

  // 대표시간표 가져오기
  @Get('/main-timetable')
  @ApiOperation({
    summary: '대표 시간표 조회',
    description: '해당 유저의 대표 시간표를 조회합니다.',
  })
  @ApiQuery({
    name: 'year',
    type: 'string',
    required: true,
    description: '연도',
  })
  @ApiQuery({
    name: 'semester',
    type: 'string',
    required: true,
    description: '학기',
  })
  @ApiResponse({
    status: 200,
    description: '대표 시간표 조회 성공 시',
    type: CommonTimetableResponseDto,
  })
  async getMainTimetable(
    @Query() timetableDto: TimetableDto,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonTimetableResponseDto> {
    return await this.timetableService.getMainTimetable(timetableDto, user);
  }

  // 유저id -> 유저가 가지고 있는 시간표 id 리스트, 각각의 학기, 대표 시간표 여부, 시간표 이름
  @Get('/user')
  @ApiOperation({
    summary: '유저의 ID로 시간표 관련 정보 조회',
    description:
      '해당 유저가 가지고 있는 시간표의 ID 리스트, 각각의 학기, 대표 시간표 여부, 시간표 이름을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저 ID로 시간표 리스트 조회 성공 시',
    type: GetTimetableByUserIdResponseDto,
    isArray: true,
  })
  async getTimetableByUserId(
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimetableByUserIdResponseDto[]> {
    return await this.timetableService.getTimetableByUserId(user.id);
  }

  // 특정 시간표 가져오기
  @Get('/:timetableId')
  @ApiOperation({
    summary: '시간표 ID로 시간표 관련 정보 조회',
    description:
      '시간표 ID로 해당 시간표와 관련된 강의,일정 정보를 반환합니다.',
  })
  @ApiParam({
    name: 'timetableId',
    description: '특정 시간표 ID',
  })
  @ApiResponse({
    status: 200,
    description: '특정 시간표 ID로 조회 성공 시',
    type: GetTimetableByTimetableIdDto,
  })
  async getTimetableByTimetableId(
    @Param('timetableId') timetableId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimetableByTimetableIdDto> {
    return await this.timetableService.getTimetableByTimetableId(
      timetableId,
      user.id,
    );
  }

  // 시간표에 등록한 강의 삭제
  @Delete('/course')
  @ApiOperation({
    summary: '시간표에 등록한 강의 삭제',
    description: '해당 시간표에 등록한 특정 강의를 삭제합니다.',
  })
  @ApiQuery({
    name: 'timetableId',
    type: 'number',
    required: true,
    description: '특정 시간표 ID',
  })
  @ApiQuery({
    name: 'courseId',
    type: 'number',
    required: true,
    description: '삭제할 강의 ID',
  })
  @ApiResponse({
    status: 200,
    description: '시간표에 등록한 강의 삭제 성공 시',
    type: CommonDeleteResponseDto,
  })
  async deleteTimetableCourse(
    @Query('timetableId') timetableId: number,
    @Query('courseId') courseId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonDeleteResponseDto> {
    return await this.timetableService.deleteTimetableCourse(
      timetableId,
      courseId,
      user,
    );
  }

  // 시간표 삭제
  @Delete('/:timetableId')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '시간표 삭제',
    description:
      '특정 시간표를 삭제합니다. 삭제 시 해당 시간표에 등록된 모든 강의도 삭제됩니다.',
  })
  @ApiParam({
    name: 'timetableId',
    description: '삭제할 시간표 ID',
  })
  @ApiResponse({
    status: 200,
    description: '시간표 삭제 성공 시',
    type: CommonDeleteResponseDto,
  })
  async deleteTimetable(
    @TransactionManager() transactionManager: EntityManager,
    @Param('timetableId') timetableId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonDeleteResponseDto> {
    return await this.timetableService.deleteTimetable(
      transactionManager,
      timetableId,
      user,
    );
  }

  // 시간표 색상 변경
  @Patch('/color/:timetableId')
  @ApiOperation({
    summary: '시간표 색상 변경',
    description: '특정 시간표의 색상을 변경합니다.',
  })
  @ApiParam({
    name: 'timetableId',
    description: '변경할 시간표 ID',
  })
  @ApiBody({
    type: UpdateTimetableColorDto,
  })
  @ApiResponse({
    status: 200,
    description: '시간표 색상 변경 성공 시',
    type: CommonTimetableResponseDto,
  })
  async updateTimetableColor(
    @Param('timetableId') timetableId: number,
    @User() user: AuthorizedUserDto,
    @Body() updateTimetableColorDto: UpdateTimetableColorDto,
  ): Promise<CommonTimetableResponseDto> {
    return await this.timetableService.updateTimetableColor(
      timetableId,
      user,
      updateTimetableColorDto.timetableColor,
    );
  }

  // 시간표 이름 변경
  @Patch('/name/:timetableId')
  @ApiOperation({
    summary: '시간표 이름 변경',
    description: '특정 시간표의 이름을 변경합니다.',
  })
  @ApiParam({
    name: 'timetableId',
    description: '변경할 시간표 ID',
  })
  @ApiBody({
    type: UpdateTimetableNameDto,
  })
  @ApiResponse({
    status: 200,
    description: '시간표 이름 변경 성공 시',
    type: CommonTimetableResponseDto,
  })
  async updateTimetableName(
    @Param('timetableId') timetableId: number,
    @User() user: AuthorizedUserDto,
    @Body() updateTimetableNameDto: UpdateTimetableNameDto,
  ): Promise<CommonTimetableResponseDto> {
    return await this.timetableService.updateTimetableName(
      timetableId,
      user,
      updateTimetableNameDto.timetableName,
    );
  }

  // 대표 시간표 변경
  @Patch('/:timetableId')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '대표 시간표 변경',
    description:
      '특정 시간표를 대표 시간표로 변경합니다. 기존에 이미 대표시간표이면 변경되지 않습니다.',
  })
  @ApiParam({
    name: 'timetableId',
    description: '대표 시간표로 변경할 시간표 ID',
  })
  @ApiBody({
    type: TimetableDto,
  })
  @ApiResponse({
    status: 200,
    description: '대표 시간표 변경 성공 시',
    type: CommonTimetableResponseDto,
  })
  async updateMainTimetable(
    @TransactionManager() transactionManager: EntityManager,
    @Param('timetableId') timetableId: number,
    @User() user: AuthorizedUserDto,
    @Body() timetableDto: TimetableDto,
  ): Promise<CommonTimetableResponseDto> {
    return await this.timetableService.updateMainTimetable(
      transactionManager,
      timetableId,
      user,
      timetableDto,
    );
  }
}
