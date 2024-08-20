import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AttendanceCheckService } from './attendance-check.service';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TakeAttendanceResponseDto } from './dto/take-attendance.dto';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { AttendanceCheckDocs } from 'src/decorators/docs/attendance-check.decorator';

@ApiTags('attendance-check')
@ApiBearerAuth('accessToken')
@AttendanceCheckDocs
@UseGuards(JwtAuthGuard)
@Controller('attendance-check')
export class AttendanceCheckController {
  constructor(
    private readonly attendanceCheckService: AttendanceCheckService,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async takeAttendance(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
  ): Promise<TakeAttendanceResponseDto> {
    return await this.attendanceCheckService.takeAttendance(
      transactionManager,
      user.id,
    );
  }
}
