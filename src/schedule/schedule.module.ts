import { Module, forwardRef } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntity } from 'src/entities/schedule.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TimetableModule } from 'src/timetable/timetable.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleEntity]),
    AuthModule,
    forwardRef(() => TimetableModule),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
