import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { GambitSessionService } from '../src/modules/gambit/sessions/application/gambit-session.service';
import {
  GambitSession,
  GambitSessionStatus,
} from '../src/modules/gambit/sessions/domain/gambit-session.entity';
import { GambitTable } from '../src/modules/gambit/domain/gambit-table.entity';
import { GambitTableService } from '../src/modules/gambit/application/gambit-table.service';
import { AuthService } from '../src/modules/auth/application/auth.service';
import { CalcMultiplier } from '../src/modules/gambit/gambit.utils';
import {
  CurrentGridSnapshot,
  GambitCard,
  GambitCardConfig,
  GridPosition,
} from '../src/modules/gambit/sessions/domain/types/gambit-session.types';
import { CreateGambitSessionDto } from '../src/modules/gambit/sessions/domain/dto/create-gambit-session.dto';

type GambitSessionRepoMock = {
  create: jest.MockedFunction<(s: Partial<GambitSession>) => GambitSession>;
  save: jest.MockedFunction<(s: GambitSession) => Promise<GambitSession>>;
  findOne: jest.MockedFunction<(c: object) => Promise<GambitSession | null>>;
  find: jest.MockedFunction<(c: object) => Promise<GambitSession[]>>;
  remove: jest.MockedFunction<(s: GambitSession) => Promise<GambitSession>>;
};

type AuthServiceMock = {
  GetChipBalance: jest.MockedFunction<
    (userId: string) => Promise<{ ChipBalance: number }>
  >;
  UpdateChipBalance: jest.MockedFunction<
    (userId: string, amount: number) => Promise<{ ChipBalance: number }>
  >;
};

type GambitTableServiceMock = {
  FindOne: jest.MockedFunction<(id: number) => Promise<GambitTable>>;
};

type CashOutRepoMock = {
  findOne: jest.MockedFunction<(c: object) => Promise<GambitSession | null>>;
  save: jest.MockedFunction<(s: GambitSession) => Promise<GambitSession>>;
};

type QueryRunnerMock = {
  connect: jest.MockedFunction<() => Promise<void>>;
  startTransaction: jest.MockedFunction<() => Promise<void>>;
  commitTransaction: jest.MockedFunction<() => Promise<void>>;
  rollbackTransaction: jest.MockedFunction<() => Promise<void>>;
  release: jest.MockedFunction<() => Promise<void>>;
  manager: { getRepository: jest.MockedFunction<() => CashOutRepoMock> };
};

type ServicePrivate = {
  GenerateBoard(): GridPosition[];
};

const MockCashOutRepo: CashOutRepoMock = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const MockQueryRunner: QueryRunnerMock = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: { getRepository: jest.fn().mockReturnValue(MockCashOutRepo) },
};

const MockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(MockQueryRunner),
};

const BuildTable = (Overrides: Partial<GambitTable> = {}): GambitTable =>
  ({
    GambitTableId: 1,
    Name: 'Test Table',
    Description: 'test',
    MinimumChipsRequired: 0,
    CardPrice: 10,
    TableMultiplier: 1,
    MinimumCardsPurchased: 5,
    MaxCardsPurchased: 20,
    Active: true,
    ...Overrides,
  }) as GambitTable;

const BuildSnapshot = (
  Overrides: Partial<CurrentGridSnapshot> = {}
): CurrentGridSnapshot => ({
  Unrevealed: Array.from({ length: 25 }, (_, i) => ({
    Position: i,
    Points: 10,
    Effect: null,
    Locked: false,
  })),
  Revealed: [],
  PendingEvent: null,
  PendingInteraction: null,
  EventsFired: [],
  ...Overrides,
});

const BuildSession = (Overrides: Partial<GambitSession> = {}): GambitSession =>
  ({
    GambitSessionId: 1,
    UserId: 'user1',
    GambitTableId: 1,
    CardsPurchased: 10,
    BurnSlotsAvailable: 10,
    ManualFlipsCount: 0,
    FirstEventFlip: 7,
    SecondEventFlip: 14,
    AccumulatedPoints: 0,
    Status: GambitSessionStatus.InProgress,
    Result: null,
    NextEffect: null,
    CurrentGridSnapshot: BuildSnapshot(),
    CreatedAt: new Date(),
    UpdatedAt: new Date(),
    ...Overrides,
  }) as GambitSession;

describe('GambitSessionService', () => {
  let Service: GambitSessionService;
  let Repo: GambitSessionRepoMock;
  let Auth: AuthServiceMock;
  let Tables: GambitTableServiceMock;

  const MockRepo: GambitSessionRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };
  const MockAuth: AuthServiceMock = {
    GetChipBalance: jest.fn(),
    UpdateChipBalance: jest.fn(),
  };
  const MockTables: GambitTableServiceMock = { FindOne: jest.fn() };

  beforeEach(async () => {
    const Module: TestingModule = await Test.createTestingModule({
      providers: [
        GambitSessionService,
        {
          provide: getRepositoryToken(GambitSession),
          useValue: MockRepo as unknown as Repository<GambitSession>,
        },
        {
          provide: DataSource,
          useValue: MockDataSource as unknown as DataSource,
        },
        { provide: AuthService, useValue: MockAuth as unknown as AuthService },
        {
          provide: GambitTableService,
          useValue: MockTables as unknown as GambitTableService,
        },
      ],
    }).compile();

    Service = Module.get<GambitSessionService>(GambitSessionService);
    Repo = MockRepo;
    Auth = MockAuth;
    Tables = MockTables;

    Repo.save.mockImplementation((s) => Promise.resolve(s));
    MockCashOutRepo.save.mockImplementation((s) => Promise.resolve(s));
    Tables.FindOne.mockResolvedValue(BuildTable());
  });

  afterEach(() => jest.clearAllMocks());

  describe('CalcMultiplier (formula)', () => {
    it('returns 1x at the minimum and grows monotonically', () => {
      const m5 = CalcMultiplier(5, 1);
      const m10 = CalcMultiplier(10, 1);
      const m20 = CalcMultiplier(20, 1);
      expect(m5).toBeCloseTo(1.4, 5);
      expect(m10).toBeGreaterThan(m5);
      expect(m20).toBeGreaterThan(m10);
    });

    it('is continuous at the segment boundaries (5 and 15)', () => {
      expect(CalcMultiplier(15, 1)).toBeCloseTo(2.6, 5);
    });
  });

  describe('GenerateBoard', () => {
    it('creates 25 sequential, unlocked positions', () => {
      const Board = (Service as unknown as ServicePrivate).GenerateBoard();
      expect(Board).toHaveLength(25);
      Board.forEach((c, i) => {
        expect(c.Position).toBe(i);
        expect(c.Locked).toBe(false);
      });
    });
  });

  describe('Create', () => {
    it('blocks a second open session', async () => {
      Repo.findOne.mockResolvedValue(BuildSession());
      await expect(
        Service.Create(
          1,
          { CardsPurchased: 10 } as CreateGambitSessionDto,
          'user1'
        )
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects out-of-range card counts', async () => {
      Repo.findOne.mockResolvedValue(null);
      await expect(
        Service.Create(
          1,
          { CardsPurchased: 99 } as CreateGambitSessionDto,
          'user1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deducts the bet (CardPrice * CardsPurchased) and hides unrevealed cards', async () => {
      Repo.findOne.mockResolvedValue(null);
      Auth.GetChipBalance.mockResolvedValue({ ChipBalance: 1000 });
      Auth.UpdateChipBalance.mockResolvedValue({ ChipBalance: 900 });
      Repo.create.mockImplementation((s) => s as GambitSession);

      const Result = await Service.Create(
        1,
        { CardsPurchased: 10 } as CreateGambitSessionDto,
        'user1'
      );

      expect(Auth.UpdateChipBalance).toHaveBeenCalledWith('user1', -100);
      expect(Result.session.Status).toBe(GambitSessionStatus.InProgress);
      expect(Result.session.BurnSlotsAvailable).toBe(10);
      expect(Result.session.Grid.Unrevealed[0]).toEqual({
        Position: 0,
        Locked: false,
      });
    });
  });

  describe('Burn — NextEffect on points', () => {
    const burnFirst = async (session: GambitSession) => {
      Repo.findOne.mockResolvedValue(session);
      return Service.Burn('user1', 0);
    };

    it('MULTIPLY doubles the next burned card points', async () => {
      const view = await burnFirst(
        BuildSession({ NextEffect: GambitCard.DOBRO_DE_POTASSIO })
      );
      expect(view.AccumulatedPoints).toBe(20);
      expect(view.NextEffect).toBeNull();
    });

    it('DIVIDE halves the next burned card points', async () => {
      const view = await burnFirst(
        BuildSession({ NextEffect: GambitCard.MELANCIDIO })
      );
      expect(view.AccumulatedPoints).toBe(5);
    });

    it('INVERT flips the sign', async () => {
      const view = await burnFirst(
        BuildSession({ NextEffect: GambitCard.INVERSAO_GRAVITACIONAL })
      );
      expect(view.AccumulatedPoints).toBe(-10);
    });

    it('CANCEL_NEXT_BURN keeps points but skips the card own effect', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Effect = GambitCard.CHRIS_JOKER;
      const view = await burnFirst(
        BuildSession({
          NextEffect: GambitCard.ANULACAO_TOTAL,
          AccumulatedPoints: 50,
          CurrentGridSnapshot: snap,
        })
      );
      expect(view.AccumulatedPoints).toBe(60);
    });
  });

  describe('Burn — immediate effects', () => {
    const burnWithEffect = async (
      effect: GambitCard,
      base: Partial<GambitSession> = {}
    ) => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Effect = effect;
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap, ...base })
      );
      return Service.Burn('user1', 0);
    };

    it('RESET_POINTS zeroes points', async () => {
      const view = await burnWithEffect(GambitCard.CHRIS_JOKER, {
        AccumulatedPoints: 80,
      });
      expect(view.AccumulatedPoints).toBe(0);
    });

    it('ADD_BURN_SLOT grants one more burn', async () => {
      const view = await burnWithEffect(GambitCard.QUANTO_MAIS_MELHOR);
      expect(view.BurnSlotsAvailable).toBe(11);
    });

    it('REMOVE_BURN_SLOT removes one burn', async () => {
      const view = await burnWithEffect(GambitCard.QUANTO_MENOS_MELHOR);
      expect(view.BurnSlotsAvailable).toBe(9);
    });

    it('a NEXT_BURN card sets NextEffect for the next burn', async () => {
      const view = await burnWithEffect(GambitCard.DOBRO_DE_POTASSIO);
      expect(view.NextEffect).toBe(GambitCard.DOBRO_DE_POTASSIO);
    });

    it('PEEK_CARDS opens a blocking SELECT_MULTIPLE_CARDS interaction', async () => {
      const view = await burnWithEffect(GambitCard.CABECINHA);
      expect(view.Grid.PendingInteraction).toEqual({
        Effect: GambitCard.CABECINHA,
        Action: 'SELECT_MULTIPLE_CARDS',
        RequiredSelections: 3,
        SelectedPositions: [],
      });
    });
  });

  describe('Burn — end of game / settlement', () => {
    it('finishes and computes Result = max(0, floor(points * CalcMultiplier))', async () => {
      Tables.FindOne.mockResolvedValue(BuildTable({ TableMultiplier: 1 }));
      const session = BuildSession({
        BurnSlotsAvailable: 1,
        ManualFlipsCount: 0,
        AccumulatedPoints: 40,
        CardsPurchased: 10,
      });
      Repo.findOne.mockResolvedValue(session);

      const view = await Service.Burn('user1', 0);

      const mult = CalcMultiplier(10, 1);
      expect(view.Status).toBe(GambitSessionStatus.Finished);
      expect(view.Result).toBe(Math.max(0, Math.floor((40 + 10) * mult)));
    });

    it('clamps a negative final score to 0', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Points = -500;
      Repo.findOne.mockResolvedValue(
        BuildSession({
          BurnSlotsAvailable: 1,
          AccumulatedPoints: 0,
          CurrentGridSnapshot: snap,
        })
      );

      const view = await Service.Burn('user1', 0);
      expect(view.Status).toBe(GambitSessionStatus.Finished);
      expect(view.Result).toBe(0);
    });

    it('rejects burning a locked card', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Locked = true;
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      await expect(Service.Burn('user1', 0)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });
  });

  describe('CashOut', () => {
    it('pays the prize, marks CashedOut and commits', async () => {
      const finished = BuildSession({
        Status: GambitSessionStatus.Finished,
        Result: 120,
      });
      Repo.findOne.mockResolvedValue(finished);
      MockCashOutRepo.findOne.mockResolvedValue(finished);
      Auth.UpdateChipBalance.mockResolvedValue({ ChipBalance: 1120 });
      Auth.GetChipBalance.mockResolvedValue({ ChipBalance: 1120 });

      const Result = await Service.CashOut('user1');

      expect(Auth.UpdateChipBalance).toHaveBeenCalledWith('user1', 120);
      expect(MockCashOutRepo.save.mock.calls[0][0].Status).toBe(
        GambitSessionStatus.CashedOut
      );
      expect(MockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(Result.reward).toBe(120);
    });

    it('rolls back when the session is not finished', async () => {
      const inProgress = BuildSession({
        Status: GambitSessionStatus.InProgress,
      });
      Repo.findOne.mockResolvedValue(inProgress);
      MockCashOutRepo.findOne.mockResolvedValue(inProgress);

      await expect(Service.CashOut('user1')).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(Auth.UpdateChipBalance).not.toHaveBeenCalled();
      expect(MockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('ResolveEvent', () => {
    it('substitutes the chosen good + bad cards into the board', async () => {
      const snap = BuildSnapshot({
        PendingEvent: {
          GoodOptions: [
            GambitCard.DOBRO_DE_POTASSIO,
            GambitCard.CABECINHA,
            GambitCard.CLARIVIDENCIA,
          ],
          BadOptions: [
            GambitCard.MELANCIDIO,
            GambitCard.MENTE_LISA,
            GambitCard.CHRIS_JOKER,
          ],
        },
      });
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );

      await Service.ResolveEvent('user1', { GoodIndex: 0, BadIndex: 1 });

      const placed = snap.Unrevealed.map((c) => c.Effect).filter(
        (e): e is GambitCard => e !== null
      );
      expect(placed).toContain(GambitCard.DOBRO_DE_POTASSIO);
      expect(placed).toContain(GambitCard.MENTE_LISA);
      expect(snap.PendingEvent).toBeNull();
    });
  });

  describe('Burn — new cards', () => {
    const burnAt = async (session: GambitSession, pos = 0) => {
      Repo.findOne.mockResolvedValue(session);
      return Service.Burn('user1', pos);
    };

    it('JACKPOT adds a large fixed amount of points (+200)', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Effect = GambitCard.JACKPOT;
      const view = await burnAt(BuildSession({ CurrentGridSnapshot: snap }));
      expect(view.AccumulatedPoints).toBe(10 + 200);
    });

    it('RATIMUNDIO adds a large negative amount (-200)', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Effect = GambitCard.RATIMUNDIO;
      const view = await burnAt(BuildSession({ CurrentGridSnapshot: snap }));
      expect(view.AccumulatedPoints).toBe(10 - 200);
    });

    it('BUMIS_INFILTRADOS (trap) does nothing beyond its own points', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Effect = GambitCard.BUMIS_INFILTRADOS;
      const view = await burnAt(
        BuildSession({ CurrentGridSnapshot: snap, AccumulatedPoints: 30 })
      );
      expect(view.AccumulatedPoints).toBe(30 + 10);
    });

    it('HEADGEAR (FORCE_NEGATIVE_NEXT) makes the next card subtract points', async () => {
      const view = await burnAt(
        BuildSession({ NextEffect: GambitCard.HEADGEAR })
      );
      expect(view.AccumulatedPoints).toBe(-10);
    });

    it('COLORIDINHO zeroes the next card points but keeps its effect', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Effect = GambitCard.JACKPOT;
      const view = await burnAt(
        BuildSession({
          NextEffect: GambitCard.COLORIDINHO,
          CurrentGridSnapshot: snap,
        })
      );
      expect(view.AccumulatedPoints).toBe(200);
    });

    it('PAO_COM_OQUE turns the highest unrevealed card negative (without revealing)', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Effect = GambitCard.PAO_COM_OQUE;
      snap.Unrevealed[5].Points = 90;
      await burnAt(BuildSession({ CurrentGridSnapshot: snap }));
      const sabotaged = snap.Unrevealed.find((c) => c.Position === 5);
      expect(sabotaged?.Points).toBe(-90);
    });
  });

  describe('ResolveEffect — BUMIS_INFILTRADOS disguise', () => {
    it('REVEAL on a BUMIS_INFILTRADOS shows a fake GOOD card, never BUMIS_INFILTRADOS', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[3].Effect = GambitCard.BUMIS_INFILTRADOS;
      snap.PendingInteraction = {
        Effect: GambitCard.CLARIVIDENCIA,
        Action: 'SELECT_CARD',
        RequiredSelections: 1,
        SelectedPositions: [],
      };
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );

      const res = await Service.ResolveEffect('user1', { Positions: [3] });
      const peek = res.PeekResult as {
        Position: number;
        Effect: GambitCard | null;
      };
      expect(peek.Effect).not.toBe(GambitCard.BUMIS_INFILTRADOS);
      expect(peek.Effect).not.toBeNull();
      expect(GambitCardConfig[peek.Effect as GambitCard].nature).toBe('Good');
    });
  });

  describe('Edge cases', () => {
    const withInteraction = (
      effect: GambitCard,
      action: 'SELECT_CARD' | 'SELECT_MULTIPLE_CARDS',
      required: number
    ) => {
      const snap = BuildSnapshot();
      snap.PendingInteraction = {
        Effect: effect,
        Action: action,
        RequiredSelections: required,
        SelectedPositions: [],
      };
      return snap;
    };

    it('PEEK does NOT flag a BUMIS_INFILTRADOS (the disguise fools the warning)', async () => {
      const snap = withInteraction(
        GambitCard.CABECINHA,
        'SELECT_MULTIPLE_CARDS',
        3
      );
      snap.Unrevealed[1].Effect = GambitCard.BUMIS_INFILTRADOS;
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      const res = await Service.ResolveEffect('user1', {
        Positions: [1, 2, 3],
      });
      expect((res.PeekResult as { AtLeastOneBad: boolean }).AtLeastOneBad).toBe(
        false
      );
    });

    it('PEEK flags a real bad card (Melancídio)', async () => {
      const snap = withInteraction(
        GambitCard.CABECINHA,
        'SELECT_MULTIPLE_CARDS',
        3
      );
      snap.Unrevealed[1].Effect = GambitCard.MELANCIDIO;
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      const res = await Service.ResolveEffect('user1', {
        Positions: [1, 2, 3],
      });
      expect((res.PeekResult as { AtLeastOneBad: boolean }).AtLeastOneBad).toBe(
        true
      );
    });

    it('REVEAL on a normal card shows its REAL effect (no disguise)', async () => {
      const snap = withInteraction(GambitCard.CLARIVIDENCIA, 'SELECT_CARD', 1);
      snap.Unrevealed[2].Effect = GambitCard.DOBRO_DE_POTASSIO;
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      const res = await Service.ResolveEffect('user1', { Positions: [2] });
      expect((res.PeekResult as { Effect: GambitCard }).Effect).toBe(
        GambitCard.DOBRO_DE_POTASSIO
      );
    });

    it('REVEAL on a BUMIS_INFILTRADOS is deterministic (same fake on repeated peeks)', async () => {
      const reveal = async () => {
        const snap = withInteraction(
          GambitCard.CLARIVIDENCIA,
          'SELECT_CARD',
          1
        );
        snap.Unrevealed[3].Effect = GambitCard.BUMIS_INFILTRADOS;
        Repo.findOne.mockResolvedValue(
          BuildSession({ CurrentGridSnapshot: snap })
        );
        const res = await Service.ResolveEffect('user1', { Positions: [3] });
        return (res.PeekResult as { Effect: GambitCard }).Effect;
      };
      expect(await reveal()).toBe(await reveal());
    });

    it('Burn is blocked while a PendingInteraction is open', async () => {
      const snap = withInteraction(
        GambitCard.CABECINHA,
        'SELECT_MULTIPLE_CARDS',
        3
      );
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      await expect(Service.Burn('user1', 0)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('Burn is blocked while a PendingEvent is open', async () => {
      const snap = BuildSnapshot({
        PendingEvent: { GoodOptions: [], BadOptions: [] },
      });
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      await expect(Service.Burn('user1', 0)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('Burn fails when no burns are left', async () => {
      Repo.findOne.mockResolvedValue(
        BuildSession({ BurnSlotsAvailable: 3, ManualFlipsCount: 3 })
      );
      await expect(Service.Burn('user1', 0)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('Burn fails on an invalid/already-revealed position', async () => {
      Repo.findOne.mockResolvedValue(BuildSession());
      await expect(Service.Burn('user1', 999)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('reaching FirstEventFlip opens a selection event (and defers finalize)', async () => {
      Repo.findOne.mockResolvedValue(
        BuildSession({
          BurnSlotsAvailable: 10,
          ManualFlipsCount: 0,
          FirstEventFlip: 1,
        })
      );
      const view = await Service.Burn('user1', 0);
      expect(view.Grid.PendingEvent).not.toBeNull();
      expect(view.Status).toBe(GambitSessionStatus.InProgress);
    });

    it('an event on the LAST burn defers settlement until the event is resolved', async () => {
      Repo.findOne.mockResolvedValue(
        BuildSession({
          BurnSlotsAvailable: 1,
          ManualFlipsCount: 0,
          FirstEventFlip: 1,
        })
      );
      const afterBurn = await Service.Burn('user1', 0);
      expect(afterBurn.Status).toBe(GambitSessionStatus.InProgress);
      expect(afterBurn.Grid.PendingEvent).not.toBeNull();

      const afterResolve = await Service.ResolveEvent('user1', {
        GoodIndex: 0,
        BadIndex: 0,
      });
      expect(afterResolve.Status).toBe(GambitSessionStatus.Finished);
    });

    it('ResolveEffect rejects the wrong number of positions', async () => {
      const snap = withInteraction(
        GambitCard.CABECINHA,
        'SELECT_MULTIPLE_CARDS',
        3
      );
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      await expect(
        Service.ResolveEffect('user1', { Positions: [0] })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('ResolveEffect rejects duplicate positions', async () => {
      const snap = withInteraction(
        GambitCard.CABECINHA,
        'SELECT_MULTIPLE_CARDS',
        3
      );
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      await expect(
        Service.ResolveEffect('user1', { Positions: [1, 1, 2] })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('ResolveEvent rejects an out-of-range index', async () => {
      const snap = BuildSnapshot({
        PendingEvent: {
          GoodOptions: [
            GambitCard.DOBRO_DE_POTASSIO,
            GambitCard.CABECINHA,
            GambitCard.CLARIVIDENCIA,
          ],
          BadOptions: [
            GambitCard.MELANCIDIO,
            GambitCard.MENTE_LISA,
            GambitCard.HEADGEAR,
          ],
        },
      });
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );
      await expect(
        Service.ResolveEvent('user1', { GoodIndex: 5, BadIndex: 0 })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('LOCK_GOOD_CARD locks a Good-tagged card, which can no longer be burned', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Effect = GambitCard.MENTE_LISA;
      snap.Unrevealed[1].Effect = GambitCard.DOBRO_DE_POTASSIO;
      Repo.findOne.mockResolvedValue(
        BuildSession({ CurrentGridSnapshot: snap })
      );

      const v1 = await Service.Burn('user1', 0);
      const locked = v1.Grid.Unrevealed.find((c) => c.Position === 1);
      expect(locked?.Locked).toBe(true);

      await expect(Service.Burn('user1', 1)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('HEADGEAR keeps an already-negative next card negative', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed[0].Points = -30;
      Repo.findOne.mockResolvedValue(
        BuildSession({
          NextEffect: GambitCard.HEADGEAR,
          CurrentGridSnapshot: snap,
        })
      );
      const view = await Service.Burn('user1', 0);
      expect(view.AccumulatedPoints).toBe(-30);
    });

    it('finalizes when no burnable card remains (avoids a soft-locked session)', async () => {
      const snap = BuildSnapshot();
      snap.Unrevealed.forEach((c) => {
        if (c.Position !== 0) c.Locked = true;
      });
      Repo.findOne.mockResolvedValue(
        BuildSession({
          BurnSlotsAvailable: 10,
          ManualFlipsCount: 0,
          CurrentGridSnapshot: snap,
        })
      );

      const view = await Service.Burn('user1', 0);
      expect(view.Status).toBe(GambitSessionStatus.Finished);
    });

    it('Create rejects insufficient chips', async () => {
      Repo.findOne.mockResolvedValue(null);
      Tables.FindOne.mockResolvedValue(BuildTable({ CardPrice: 10 }));
      Auth.GetChipBalance.mockResolvedValue({ ChipBalance: 50 });
      await expect(
        Service.Create(
          1,
          { CardsPurchased: 10 } as CreateGambitSessionDto,
          'user1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('Create rejects an inactive table', async () => {
      Repo.findOne.mockResolvedValue(null);
      Tables.FindOne.mockResolvedValue(BuildTable({ Active: false }));
      await expect(
        Service.Create(
          1,
          { CardsPurchased: 10 } as CreateGambitSessionDto,
          'user1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
