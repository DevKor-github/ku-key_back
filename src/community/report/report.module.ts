import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from 'src/entities/report.entity';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { ReportController } from './report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity])],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
  exports: [ReportService],
})
export class ReportModule {}
