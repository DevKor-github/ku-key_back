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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateTimetableCourseResponseDto } from './dto/create-timetable-course-response.dto';
import { CommonTimetableResponseDto } from './dto/common-timetable-response.dto';
import { CommonDeleteResponseDto } from './dto/common-delete-response.dto';
import { GetTimetableByTimetableIdDto } from './dto/get-timetable-timetable.dto';
import { UpdateTimetableColorDto } from './dto/update-timetable-color.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { TimetableDocs } from 'src/decorators/docs/timetable.decorator';
import { GetTodayTimetableResponse } from './dto/get-today-timetable-response.dto';

@Controller('timetable')
@ApiTags('timetable')
@ApiBearerAuth('accessToken')
@TimetableDocs
@UseGuards(JwtAuthGuard) // 시간표 관련 API는 인증 필요해서 JwtAuthGuard 사용
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  // timetable 에 course 추가 (존재하는 강의가 있을 때 추가하지 못하도록)
  @Post('course')
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
  async getMainTimetable(
    @Query() timetableDto: TimetableDto,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonTimetableResponseDto> {
    return await this.timetableService.getMainTimetable(timetableDto, user);
  }

  // 유저id -> 유저가 가지고 있는 시간표 id 리스트, 각각의 학기, 대표 시간표 여부, 시간표 이름
  @Get('/user')
  async getTimetableByUserId(
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimetableByUserIdResponseDto[]> {
    return await this.timetableService.getTimetableByUserId(user.id);
  }

  // 오늘 시간표 가져오기
  @Get('/today')
  async getTodayTimetable(
    @Query() timetableDto: TimetableDto,
    @User() user: AuthorizedUserDto,
  ): Promise<GetTodayTimetableResponse> {
    return await this.timetableService.getTodayTimetable(timetableDto, user);
  }

  // 특정 시간표 가져오기
  @Get('/:timetableId')
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
