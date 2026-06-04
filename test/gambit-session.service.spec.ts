import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GambitSessionService } from '../src/modules/gambit/sessions/application/gambit-session.service';
import {
  GambitSession,
  GambitSessionStatus,
} from '../src/modules/gambit/sessions/domain/gambit-session.entity';
import { GambitTable } from '../src/modules/gambit/domain/gambit-table.entity';
import { User } from '../src/modules/auth/domain/user.entity';
import { CreateGambitSessionDto } from '../src/modules/gambit/sessions/domain/dto/create-gambit-session.dto';
import { UpdateGambitSessionDto } from '../src/modules/gambit/sessions/domain/dto/update-gambit-session.dto';

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

const MockSession: GambitSession = {
  GambitSessionId: 1,
  UserId: 'user-uuid-123',
  GambitTableId: 1,
  CardsPurchased: 10,
  ManualFlipsCount: 0,
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

  const MockRepo: GambitSessionRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GambitSessionService,
        {
          provide: getRepositoryToken(GambitSession),
          useValue: MockRepo as unknown as GambitSessionRepoMock,
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
      repo.create.mockReturnValue(MockSession);
      repo.save.mockResolvedValue(MockSession);

      const Result = await service.Create(1, Dto, 'user-uuid-123');

      expect(repo.create).toHaveBeenCalledWith({
        ...Dto,
        GambitTableId: 1,
        UserId: 'user-uuid-123',
        Status: GambitSessionStatus.InProgress,
      });
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
