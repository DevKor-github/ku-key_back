import { Test, TestingModule } from '@nestjs/testing';
import { TimeTableService } from './timetable.service';

describe('TimetableService', () => {
  let service: TimeTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeTableService],
    }).compile();

    service = module.get<TimeTableService>(TimeTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
