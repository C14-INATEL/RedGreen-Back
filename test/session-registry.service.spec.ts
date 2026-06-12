import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { SessionRegistryService } from '../src/modules/sessions/application/session-registry.service';
import { GameType } from '../src/modules/sessions/domain/enums/game-type.enum';
import { ActiveSession } from '../src/modules/sessions/domain/active-session.entity';

type ManagerMock = {
  insert: jest.MockedFunction<
    (entity: unknown, data: unknown) => Promise<void>
  >;
  delete: jest.MockedFunction<
    (entity: unknown, criteria: unknown) => Promise<void>
  >;
};

describe('SessionRegistryService', () => {
  let service: SessionRegistryService;
  let manager: ManagerMock;

  beforeEach(async () => {
    manager = { insert: jest.fn(), delete: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionRegistryService],
    }).compile();

    service = module.get<SessionRegistryService>(SessionRegistryService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('acquire', () => {
    it('should insert an ActiveSession row', async () => {
      manager.insert.mockResolvedValue(undefined);

      await service.acquire(
        manager as unknown as EntityManager,
        'user-1',
        GameType.Slot,
        42
      );

      expect(manager.insert).toHaveBeenCalledWith(ActiveSession, {
        UserId: 'user-1',
        GameType: GameType.Slot,
        ReferenceId: 42,
      });
    });

    it('should throw ConflictException when Postgres 23505 is raised', async () => {
      const pgError = { code: '23505' };
      manager.insert.mockRejectedValue(pgError);

      await expect(
        service.acquire(
          manager as unknown as EntityManager,
          'user-1',
          GameType.Gambit,
          7
        )
      ).rejects.toThrow(ConflictException);
    });

    it('should re-throw other DB errors unchanged', async () => {
      const otherError = new Error('connection lost');
      manager.insert.mockRejectedValue(otherError);

      await expect(
        service.acquire(
          manager as unknown as EntityManager,
          'user-1',
          GameType.Slot,
          1
        )
      ).rejects.toThrow('connection lost');
    });
  });

  describe('release', () => {
    it('should delete the ActiveSession row for the user', async () => {
      manager.delete.mockResolvedValue(undefined);

      await service.release(manager as unknown as EntityManager, 'user-1');

      expect(manager.delete).toHaveBeenCalledWith(ActiveSession, {
        UserId: 'user-1',
      });
    });
  });
});
