import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipController } from './friendship.controller';

describe('FriendController', () => {
  let controller: FriendshipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendshipController],
    }).compile();

    controller = module.get<FriendshipController>(FriendshipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
