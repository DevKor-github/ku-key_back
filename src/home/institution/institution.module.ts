import { Module } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { InstitutionController } from './institution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionEntity } from 'src/entities/institution.entity';
import { InstitutionRepository } from './institution.repository';
import { UserRepository } from 'src/user/user.repository';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([InstitutionEntity]), CommonModule],
  providers: [InstitutionService, InstitutionRepository, UserRepository],
  controllers: [InstitutionController],
})
export class InstitutionModule {}
