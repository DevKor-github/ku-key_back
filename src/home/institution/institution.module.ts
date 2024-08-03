import { Module } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { InstitutionController } from './institution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionEntity } from 'src/entities/institution.entity';
import { InstitutionRepository } from './institution.repository';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstitutionEntity]),
    CommonModule,
    UserModule,
  ],
  providers: [InstitutionService, InstitutionRepository],
  controllers: [InstitutionController],
})
export class InstitutionModule {}
