import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GambitSessionService } from '../src/modules/gambit/sessions/application/gambit-session.service';
import {
  GambitSession,
  GambitSessionStatus,
} from '../src/modules/gambit/sessions/domain/gambit-session.entity';
import { GambitTable } from '../src/modules/gambit/domain/gambit-table.entity';
import { User } from '../src/modules/auth/domain/user.entity';
import { CreateGambitSessionDto } from '../src/modules/gambit/sessions/domain/dto/create-gambit-session.dto';
import { UpdateGambitSessionDto } from '../src/modules/gambit/sessions/domain/dto/update-gambit-session.dto';
import {
  FIRST_EVENT_RANGE,
  SECOND_EVENT_RANGE,
} from '../src/modules/gambit/gambit.constants';
import { SessionRegistryService } from '../src/modules/sessions/application/session-registry.service';
import { ActiveSession } from '../src/modules/sessions/domain/active-session.entity';
import { GameType } from '../src/modules/sessions/domain/enums/game-type.enum';

type GambitSessionRepoMock = {
  create: jest.MockedFunction<
    (session: Partial<GambitSession>) => GambitSession
  >;
  save: jest.MockedFunction<(session: GambitSession) => Promise<GambitSession>>;
  find: jest.MockedFunction<(criteria: object) => Promise<GambitSession[]>>;
  findOne: jest.MockedFunction<
    (criteria: object) => Promise<GambitSession | null>
  >;
  remove: jest.MockedFunction<
    (session: GambitSession) => Promise<GambitSession>
  >;
};

function makeManagerMock() {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  };
}

function makeQRMock(mgr: ReturnType<typeof makeManagerMock>) {
  return {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mgr,
  };
}

const MockActiveTable = {
  GambitTableId: 1,
  Name: 'Test',
  Description: null,
  MinimumChipsRequired: 0,
  CardPrice: 10,
  TableMultiplier: 1,
  MinimumCardsPurchased: 1,
  MaxCardsPurchased: 20,
  Active: true,
} as unknown as GambitTable;

const MockSession: GambitSession = {
  GambitSessionId: 1,
  UserId: 'user-uuid-123',
  GambitTableId: 1,
  CardsPurchased: 10,
  ManualFlipsCount: 0,
  FirstEventFlip: 7,
  SecondEventFlip: 14,
  BurnSlotsAvailable: 10,
  CurrentGridSnapshot: null,
  AccumulatedPoints: 0,
  Status: GambitSessionStatus.InProgress,
  Result: null,
  NextEffect: null,
  CreatedAt: new Date(),
  UpdatedAt: new Date(),
  User: {} as unknown as User,
  GambitTable: {} as unknown as GambitTable,
};

describe('GambitSessionService', () => {
  let service: GambitSessionService;
  let repo: GambitSessionRepoMock;
  let registryMock: { acquire: jest.Mock; release: jest.Mock };

  const MockRepo: GambitSessionRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    registryMock = {
      acquire: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GambitSessionService,
        {
          provide: getRepositoryToken(GambitSession),
          useValue: MockRepo as unknown as GambitSessionRepoMock,
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn() },
        },
        {
          provide: SessionRegistryService,
          useValue: registryMock,
        },
      ],
    }).compile();

    service = module.get<GambitSessionService>(GambitSessionService);
    repo = MockRepo;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create', () => {
    it('should create a session with Status InProgress', async () => {
      const Dto: CreateGambitSessionDto = { CardsPurchased: 10 };

      const mgr = makeManagerMock();
      const qr = makeQRMock(mgr);

      mgr.findOne.mockImplementation((entity: unknown) => {
        if (entity === GambitTable) return Promise.resolve(MockActiveTable);
        if (entity === ActiveSession) return Promise.resolve(null);
        return Promise.resolve(null);
      });
      mgr.create.mockReturnValue(MockSession);
      mgr.save.mockResolvedValue(MockSession);

      const ds = service['dataSource'] as unknown as {
        createQueryRunner: jest.Mock;
      };
      ds.createQueryRunner = jest.fn().mockReturnValue(qr);

      const Result = await service.Create(1, Dto, 'user-uuid-123');

      expect(mgr.create).toHaveBeenCalledWith(
        GambitSession,
        expect.objectContaining({
          GambitTableId: 1,
          UserId: 'user-uuid-123',
          Status: GambitSessionStatus.InProgress,
          BurnSlotsAvailable: Dto.CardsPurchased,
        })
      );

      const CallArg = (
        mgr.create.mock.calls[0] as unknown[]
      )[1] as GambitSession;
      expect(CallArg.FirstEventFlip).toBeGreaterThanOrEqual(
        FIRST_EVENT_RANGE.MIN
      );
      expect(CallArg.FirstEventFlip).toBeLessThanOrEqual(FIRST_EVENT_RANGE.MAX);
      expect(CallArg.SecondEventFlip).toBeGreaterThanOrEqual(
        SECOND_EVENT_RANGE.MIN
      );
      expect(CallArg.SecondEventFlip).toBeLessThanOrEqual(
        SECOND_EVENT_RANGE.MAX
      );

      expect(registryMock.acquire).toHaveBeenCalledWith(
        mgr,
        'user-uuid-123',
        GameType.Gambit,
        MockSession.GambitSessionId
      );

      expect(qr.commitTransaction).toHaveBeenCalledTimes(1);
      expect(Result.Status).toBe(GambitSessionStatus.InProgress);
    });
  });

  describe('FindAll', () => {
    it('should return sessions filtered by GambitTableId and UserId', async () => {
      repo.find.mockResolvedValue([MockSession]);

      const Result = await service.FindAll(1, 'user-uuid-123');

      expect(repo.find).toHaveBeenCalledWith({
        where: { GambitTableId: 1, UserId: 'user-uuid-123' },
      });
      expect(Result).toEqual([MockSession]);
    });
  });

  describe('FindOne', () => {
    it('should return the session when found', async () => {
      repo.findOne.mockResolvedValue(MockSession);

      const Result = await service.FindOne(1, 1, 'user-uuid-123');

      expect(Result).toEqual(MockSession);
    });

    it('should throw NotFoundException when session does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.FindOne(1, 99, 'user-uuid-123')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('Update', () => {
    it('should update and return the modified session', async () => {
      const Dto: UpdateGambitSessionDto = { CardsPurchased: 15 };
      const UpdatedSession = { ...MockSession, CardsPurchased: 15 };
      repo.findOne.mockResolvedValue(MockSession);
      repo.save.mockResolvedValue(UpdatedSession);

      const Result = await service.Update(1, 1, Dto, 'user-uuid-123');

      expect(Result.CardsPurchased).toBe(15);
    });

    it('should throw NotFoundException when session does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.Update(1, 99, {}, 'user-uuid-123')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('Remove', () => {
    it('should remove the session successfully', async () => {
      repo.findOne.mockResolvedValue(MockSession);
      repo.remove.mockResolvedValue(MockSession);

      await expect(
        service.Remove(1, 1, 'user-uuid-123')
      ).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith(MockSession);
    });

    it('should throw NotFoundException when session does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.Remove(1, 99, 'user-uuid-123')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
