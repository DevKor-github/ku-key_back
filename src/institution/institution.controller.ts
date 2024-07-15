import { Controller, Get } from '@nestjs/common';
import { InstitutionService } from './institution.service';

@Controller('institution')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get()
  async getInstitutionList() {}
}
