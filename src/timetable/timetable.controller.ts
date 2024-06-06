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
} from '@nestjs/common';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { TimeTableDto } from './dto/timetable.dto';
import { TimeTableService } from './timetable.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { GetTimeTableByUserIdResponseDto } from './dto/userId-timetable.dto';
import { GetTimeTableByTimeTableIdResponseDto } from './dto/timetableId-timetable.dto';
import { UpdateTimeTableNameDto } from './dto/update-timetable-name.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTimeTableCourseResponseDto } from './dto/create-timetable-course-response.dto';
import { CommonTimeTableResponseDto } from './dto/common-timetable-response.dto';
import { CommonDeleteResponseDto } from './dto/common-delete-response.dto';

@Controller('timetable')
@ApiTags('timetable')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard) // 시간표 관련 API는 인증 필요해서 JwtAuthGuard 사용
export class TimeTableController {
  constructor(private readonly timeTableService: TimeTableService) {}

  // timetable 에 course 추가 (존재하는 강의가 있을 때 추가하지 못하도록)
  @Post('course')
  @ApiOperation({
    summary: '시간표에 강의 추가',
    description:
      '시간표에 특정 강의를 추가합니다. 해당 시간에 이미 등록된 개인 스케쥴이나 강의가 있을 경우 추가되지 않습니다.',
  })
  @ApiQuery({
    name: 'timeTableId',
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
    type: CreateTimeTableCourseResponseDto,
  })
  async createTimeTableCourse(
    @Query('timeTableId') timeTableId: number,
    @Query('courseId') courseId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<CreateTimeTableCourseResponseDto> {
    return await this.timeTableService.createTimeTableCourse(
      timeTableId,
      courseId,
      user,
    );
  }

  // 시간표 생성 (시간표 틀)
  @Post()
  @ApiOperation({
    summary: '시간표 생성',
    description:
      '해당 연도, 학기에 시간표를 생성합니다. 처음 만들어진 시간표가 대표시간표가 되며, 한 학기에 최대 3개까지 시간표 생성이 가능합니다.',
  })
  @ApiBody({
    type: CreateTimeTableDto,
  })
  @ApiResponse({
    status: 201,
    description: '시간표 생성 성공 시',
    type: CommonTimeTableResponseDto,
  })
  async createTimeTable(
    @Body() createTimeTableDto: CreateTimeTableDto,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonTimeTableResponseDto> {
    return await this.timeTableService.createTimeTable(
      createTimeTableDto,
      user,
    );
  }

  // 대표시간표 가져오기
  @Get('/main-timetable')
  @ApiOperation({
    summary: '대표 시간표 조회',
    description: '해당 유저의 대표 시간표를 조회합니다.',
  })
  @ApiBody({
    type: TimeTableDto,
  })
  @ApiResponse({
    status: 200,
    description: '대표 시간표 조회 성공 시',
    type: CommonTimeTableResponseDto,
  })
  async getMainTimeTable(
    @Body() timeTableDto: TimeTableDto,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonTimeTableResponseDto> {
    return await this.timeTableService.getMainTimeTable(timeTableDto, user);
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
    type: GetTimeTableByUserIdResponseDto,
    isArray: true,
  })
  async getTimeTableByUserId(
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimeTableByUserIdResponseDto[]> {
    return await this.timeTableService.getTimeTableByUserId(user.id);
  }

  // 특정 시간표 가져오기
  @Get('/:timeTableId')
  @ApiOperation({
    summary: '시간표 ID로 시간표 관련 정보 조회',
    description: '시간표 ID로 해당 시간표와 관련된 강의 정보를 반환합니다.',
  })
  @ApiParam({
    name: 'timeTableId',
    description: '특정 시간표 ID',
  })
  @ApiResponse({
    status: 200,
    description: '특정 시간표 ID로 조회 성공 시',
    type: GetTimeTableByTimeTableIdResponseDto,
    isArray: true,
  })
  async getTimeTableByTimeTableId(
    @Param('timeTableId') timeTableId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimeTableByTimeTableIdResponseDto[]> {
    return await this.timeTableService.getTimeTableByTimeTableId(
      timeTableId,
      user,
    );
  }

  // 시간표에 등록한 강의 삭제
  @Delete('/course')
  @ApiOperation({
    summary: '시간표에 등록한 강의 삭제',
    description: '해당 시간표에 등록한 특정 강의를 삭제합니다.',
  })
  @ApiQuery({
    name: 'timeTableId',
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
  async deleteTimeTableCourse(
    @Query('timeTableId') timeTableId: number,
    @Query('courseId') courseId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonDeleteResponseDto> {
    return await this.timeTableService.deleteTimeTableCourse(
      timeTableId,
      courseId,
      user,
    );
  }

  // 시간표 삭제
  @Delete('/:timeTableId')
  @ApiOperation({
    summary: '시간표 삭제',
    description:
      '특정 시간표를 삭제합니다. 삭제 시 해당 시간표에 등록된 모든 강의도 삭제됩니다.',
  })
  @ApiParam({
    name: 'timeTableId',
    description: '삭제할 시간표 ID',
  })
  @ApiResponse({
    status: 200,
    description: '시간표 삭제 성공 시',
    type: CommonDeleteResponseDto,
  })
  async deleteTimeTable(
    @Param('timeTableId') timeTableId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<CommonDeleteResponseDto> {
    return await this.timeTableService.deleteTimeTable(timeTableId, user);
  }

  // 시간표 이름 변경
  @Patch('/name/:timeTableId')
  @ApiOperation({
    summary: '시간표 이름 변경',
    description: '특정 시간표의 이름을 변경합니다.',
  })
  @ApiParam({
    name: 'timeTableId',
    description: '변경할 시간표 ID',
  })
  @ApiBody({
    type: UpdateTimeTableNameDto,
  })
  @ApiResponse({
    status: 200,
    description: '시간표 이름 변경 성공 시',
    type: CommonTimeTableResponseDto,
  })
  async updateTimeTableName(
    @Param('timeTableId') timeTableId: number,
    @User() user: AuthorizedUserDto,
    @Body() updateTimeTableNameDto: UpdateTimeTableNameDto,
  ): Promise<CommonTimeTableResponseDto> {
    return await this.timeTableService.updateTimeTableName(
      timeTableId,
      user,
      updateTimeTableNameDto.tableName,
    );
  }

  // 대표 시간표 변경
  @Patch('/:timeTableId')
  @ApiOperation({
    summary: '대표 시간표 변경',
    description:
      '특정 시간표를 대표 시간표로 변경합니다. 기존에 이미 대표시간표이면 변경되지 않습니다.',
  })
  @ApiParam({
    name: 'timeTableId',
    description: '대표 시간표로 변경할 시간표 ID',
  })
  @ApiBody({
    type: TimeTableDto,
  })
  @ApiResponse({
    status: 200,
    description: '대표 시간표 변경 성공 시',
    type: CommonTimeTableResponseDto,
  })
  async updateMainTimeTable(
    @Param('timeTableId') timeTableId: number,
    @User() user: AuthorizedUserDto,
    @Body() timeTableDto: TimeTableDto,
  ): Promise<CommonTimeTableResponseDto> {
    return await this.timeTableService.updateMainTimeTable(
      timeTableId,
      user,
      timeTableDto,
    );
  }
}
