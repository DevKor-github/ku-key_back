import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarRepository } from './calendar.repository';
import { CalendarEntity } from 'src/entities/calendar.entity';
import { UserRepository } from 'src/user/user.repository';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEntity]), CommonModule],
  providers: [CalendarService, CalendarRepository, UserRepository],
  controllers: [CalendarController],
})
export class CalendarModule {}
