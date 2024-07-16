import { Module } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { InstitutionController } from './institution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionEntity } from 'src/entities/institution.entity';
import { InstitutionRepository } from './institution.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InstitutionEntity])],
  providers: [InstitutionService, InstitutionRepository],
  controllers: [InstitutionController],
})
export class InstitutionModule {}
