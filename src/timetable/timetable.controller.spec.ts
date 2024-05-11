import { Test, TestingModule } from '@nestjs/testing';
import { TimeTableController } from './timetable.controller';

describe('TimetableController', () => {
  let controller: TimeTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeTableController],
    }).compile();

    controller = module.get<TimeTableController>(TimeTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
