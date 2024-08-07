import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AttendanceCheckService } from './attendance-check.service';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  TakeAttendanceRequestDto,
  TakeAttendanceResponseDto,
} from './dto/take-attendance.dto';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';

@ApiTags('attendance-check')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('attendance-check')
export class AttendanceCheckController {
  constructor(
    private readonly attendanceCheckService: AttendanceCheckService,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '출석 체크',
    description: '이미 출석한 날에는 더 이상 출석할 수 없습니다.',
  })
  @ApiBody({
    type: TakeAttendanceRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '출석 체크 성공',
    type: TakeAttendanceResponseDto,
  })
  async takeAttendance(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Body() takeAttendanceRequestDto: TakeAttendanceRequestDto,
  ): Promise<TakeAttendanceResponseDto> {
    return await this.attendanceCheckService.takeAttendance(
      transactionManager,
      user.id,
      takeAttendanceRequestDto,
    );
  }
}
