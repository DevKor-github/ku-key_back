import { Module } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { CalenderController } from './calender.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalenderEntity } from 'src/entities/calender.entity';
import { CalenderRepository } from './calender.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CalenderEntity])],
  providers: [CalenderService, CalenderRepository],
  controllers: [CalenderController],
})
export class CalenderModule {}
