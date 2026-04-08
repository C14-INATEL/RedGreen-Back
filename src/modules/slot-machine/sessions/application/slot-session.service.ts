import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlotSession, SlotSessionStatus } from '../domain/slot-session.entity';
import { CreateSlotSessionDto } from '../domain/dto/create-slot-session.dto';
import { UpdateSlotSessionDto } from '../domain/dto/update-slot-session.dto';
import type {
  CurrentSpinResultState,
  RerollState,
} from '../domain/types/slot-session.types';

@Injectable()
export class SlotSessionService {
  constructor(
    @InjectRepository(SlotSession)
    private readonly SlotSessionRepo: Repository<SlotSession>
  ) {}

  async create(DTO: CreateSlotSessionDto): Promise<SlotSession> {
    const Now = new Date();
    const SlotSession = this.SlotSessionRepo.create({
      UserId: DTO.UserId,
      SlotMachineId: DTO.SlotMachineId,
      Status: DTO.Status || SlotSessionStatus.Active,
      StartedAt: DTO.StartedAt ? new Date(DTO.StartedAt) : Now,
      LastInteractionAt: DTO.LastInteractionAt
        ? new Date(DTO.LastInteractionAt)
        : Now,
      EndedAt: DTO.EndedAt ? new Date(DTO.EndedAt) : null,
      CurrentRewardSnapshot: DTO.CurrentRewardSnapshot ?? 0,
      CurrentSpinResult: DTO.CurrentSpinResult as CurrentSpinResultState,
      CurrentRerollsSpent: DTO.CurrentRerollsSpent as RerollState,
    });
    return this.SlotSessionRepo.save(SlotSession);
  }

  async findAll(): Promise<SlotSession[]> {
    return this.SlotSessionRepo.find();
  }

  async findOne(Id: number): Promise<SlotSession> {
    const SlotSession = await this.SlotSessionRepo.findOneBy({
      SlotSessionId: Id,
    });
    if (!SlotSession) {
      throw new NotFoundException(`SlotSession with Id ${Id} not found`);
    }
    return SlotSession;
  }

  async update(Id: number, DTO: UpdateSlotSessionDto): Promise<SlotSession> {
    const SlotSession = await this.findOne(Id);

    if (DTO.UserId !== undefined) {
      SlotSession.UserId = DTO.UserId;
    }
    if (DTO.SlotMachineId !== undefined) {
      SlotSession.SlotMachineId = DTO.SlotMachineId;
    }
    if (DTO.Status !== undefined) {
      SlotSession.Status = DTO.Status;
    }
    if (DTO.StartedAt !== undefined) {
      SlotSession.StartedAt = new Date(DTO.StartedAt);
    }
    if (DTO.LastInteractionAt !== undefined) {
      SlotSession.LastInteractionAt = new Date(DTO.LastInteractionAt);
    }
    if (DTO.EndedAt !== undefined) {
      SlotSession.EndedAt = DTO.EndedAt ? new Date(DTO.EndedAt) : null;
    }
    if (DTO.CurrentRewardSnapshot !== undefined) {
      SlotSession.CurrentRewardSnapshot = DTO.CurrentRewardSnapshot;
    }
    if (DTO.CurrentSpinResult !== undefined) {
      SlotSession.CurrentSpinResult =
        DTO.CurrentSpinResult as CurrentSpinResultState;
    }
    if (DTO.CurrentRerollsSpent !== undefined) {
      SlotSession.CurrentRerollsSpent = DTO.CurrentRerollsSpent as RerollState;
    }

    return this.SlotSessionRepo.save(SlotSession);
  }

  async remove(Id: number): Promise<void> {
    const SlotSession = await this.findOne(Id);
    await this.SlotSessionRepo.remove(SlotSession);
  }
}
