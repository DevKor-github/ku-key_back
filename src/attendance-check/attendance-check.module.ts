import { Module } from '@nestjs/common';
import { AttendanceCheckController } from './attendance-check.controller';
import { AttendanceCheckService } from './attendance-check.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceCheckEntity } from 'src/entities/attendance-check.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceCheckEntity]), UserModule],
  controllers: [AttendanceCheckController],
  providers: [AttendanceCheckService],
})
export class AttendanceCheckModule {}
