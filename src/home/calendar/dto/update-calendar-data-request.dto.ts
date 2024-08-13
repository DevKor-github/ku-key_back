import { PartialType } from '@nestjs/swagger';
import { CreateCalendarDataRequestDto } from './create-calendar-data-request.dto';

export class UpdateCalendarDataRequestDto extends PartialType(
  CreateCalendarDataRequestDto,
) {}
