import { PartialType } from '@nestjs/swagger';
import { CreateClubRequestDto } from './create-club-request-dto';

export class UpdateClubRequestDto extends PartialType(CreateClubRequestDto) {}
