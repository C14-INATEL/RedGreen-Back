import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GambitSession,
  GambitSessionStatus,
} from '../domain/gambit-session.entity';
import { CreateGambitSessionDto } from '../domain/dto/create-gambit-session.dto';
import { UpdateGambitSessionDto } from '../domain/dto/update-gambit-session.dto';
import { FIRST_EVENT_RANGE, SECOND_EVENT_RANGE } from '../../gambit.constants';

@Injectable()
export class GambitSessionService {
  constructor(
    @InjectRepository(GambitSession)
    private readonly GambitSessionRepo: Repository<GambitSession>
  ) {}

  async Create(
    GambitTableId: number,
    DTO: CreateGambitSessionDto,
    UserId: string
  ): Promise<GambitSession> {
    const GambitSession = this.GambitSessionRepo.create({
      ...DTO,
      GambitTableId,
      UserId,
      Status: GambitSessionStatus.InProgress,
      BurnSlotsAvailable: DTO.CardsPurchased,
      FirstEventFlip:
        Math.floor(
          Math.random() * (FIRST_EVENT_RANGE.MAX - FIRST_EVENT_RANGE.MIN + 1)
        ) + FIRST_EVENT_RANGE.MIN,
      SecondEventFlip:
        Math.floor(
          Math.random() * (SECOND_EVENT_RANGE.MAX - SECOND_EVENT_RANGE.MIN + 1)
        ) + SECOND_EVENT_RANGE.MIN,
    });
    return this.GambitSessionRepo.save(GambitSession);
  }

  private ValidateNoBlockingState(Session: GambitSession): void {
    const Snapshot = Session.CurrentGridSnapshot;
    if (!Snapshot) return;
    if (Snapshot.PendingEvent !== null) {
      throw new BadRequestException(
        'Cannot perform action: a pending event must be resolved first'
      );
    }
    if (Snapshot.PendingInteraction !== null) {
      throw new BadRequestException(
        'Cannot perform action: a pending interaction must be resolved first'
      );
    }
  }

  async FindAll(
    GambitTableId: number,
    UserId: string
  ): Promise<GambitSession[]> {
    return this.GambitSessionRepo.find({
      where: { GambitTableId, UserId },
    });
  }

  async FindOne(
    GambitTableId: number,
    Id: number,
    UserId: string
  ): Promise<GambitSession> {
    const GambitSession = await this.GambitSessionRepo.findOne({
      where: { GambitSessionId: Id, GambitTableId, UserId },
    });
    if (!GambitSession) {
      throw new NotFoundException(
        `GambitSession with ID ${Id} not found for this gambit table and user`
      );
    }
    return GambitSession;
  }

  async Update(
    GambitTableId: number,
    Id: number,
    DTO: UpdateGambitSessionDto,
    UserId: string
  ): Promise<GambitSession> {
    const GambitSession = await this.FindOne(GambitTableId, Id, UserId);
    Object.assign(GambitSession, DTO);
    return this.GambitSessionRepo.save(GambitSession);
  }

  async Remove(
    GambitTableId: number,
    Id: number,
    UserId: string
  ): Promise<void> {
    const GambitSession = await this.FindOne(GambitTableId, Id, UserId);
    await this.GambitSessionRepo.remove(GambitSession);
  }
}
