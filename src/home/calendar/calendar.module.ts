import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarRepository } from './calendar.repository';
import { CalendarEntity } from 'src/entities/calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEntity])],
  providers: [CalendarService, CalendarRepository],
  controllers: [CalendarController],
})
export class CalendarModule {}
