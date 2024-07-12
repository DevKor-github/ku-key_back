import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalenderRepository } from './calender.repository';
import { GetCalenderDataResponseDto } from './dto/get-calender-data-response-dto';
import { CreateCalenderDataRequestDto } from './dto/create-calender-data-request.dto';

@Injectable()
export class CalenderService {
  constructor(
    @InjectRepository(CalenderRepository)
    private readonly calenderRepository: CalenderRepository,
  ) {}

  async getCalenderData(date: string): Promise<GetCalenderDataResponseDto> {
    const newDate = new Date(date);
    const calenderData = await this.calenderRepository.findOne({
      where: { date: newDate },
    });

    // 저장된 행사/일정이 없으면 빈 문자열 반환
    if (!calenderData) {
      return {
        title: '',
        description: '',
      };
    }

    return {
      title: calenderData.title,
      description: calenderData.description,
    };
  }

  async createCalenderData(requestDto: CreateCalenderDataRequestDto) {
    const { date, title, description } = requestDto;
    const calenderData = await this.calenderRepository.createCalenderData(
      date,
      title,
      description,
    );

    return {
      title: calenderData.title,
      description: calenderData.description,
    };
  }
}
