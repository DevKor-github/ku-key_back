import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from 'src/entities/report.entity';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { ReportController } from './report.controller';
import { CommonModule } from 'src/common/common.module';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity]), CommonModule],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository, UserRepository],
  exports: [ReportService],
})
export class ReportModule {}
