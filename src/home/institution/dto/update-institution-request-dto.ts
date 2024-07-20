import { PartialType } from '@nestjs/swagger';
import { CreateInstitutionRequestDto } from './create-institution-request-dto';

export class UpdateInstitutionRequestDto extends PartialType(
  CreateInstitutionRequestDto,
) {}
