import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlotSession, SlotSessionStatus } from '../domain/slot-session.entity';
import { CreateSlotSessionDto } from '../domain/dto/create-slot-session.dto';
import { UpdateSlotSessionDto } from '../domain/dto/update-slot-session.dto';

@Injectable()
export class SlotSessionService {
  constructor(
    @InjectRepository(SlotSession)
    private readonly SlotSessionRepo: Repository<SlotSession>
  ) {}

  async create(dto: CreateSlotSessionDto): Promise<SlotSession> {
    const now = new Date();
    const SlotSession = this.SlotSessionRepo.create({
      ...dto,
      Status: dto.Status || SlotSessionStatus.Active,
      StartedAt: dto.StartedAt ? new Date(dto.StartedAt) : now,
      LastInteractionAt: dto.LastInteractionAt
        ? new Date(dto.LastInteractionAt)
        : now,
      CurrentRewardSnapshot: dto.CurrentRewardSnapshot ?? 0,
      CurrentRerollsSpent: dto.CurrentRerollsSpent ?? {
        Rerolls: {
          Max: 0,
          Used: 0,
        },
      },
    });
    return this.SlotSessionRepo.save(SlotSession);
  }

  async findAll(): Promise<SlotSession[]> {
    return this.SlotSessionRepo.find();
  }

  async findOne(id: number): Promise<SlotSession> {
    const SlotSession = await this.SlotSessionRepo.findOneBy({
      SlotSessionId: id,
    });
    if (!SlotSession) {
      throw new NotFoundException(`SlotSession with ID ${id} not found`);
    }
    return SlotSession;
  }

  async update(id: number, dto: UpdateSlotSessionDto): Promise<SlotSession> {
    const SlotSession = await this.findOne(id);

    if (dto.UserId !== undefined) {
      SlotSession.UserId = dto.UserId;
    }
    if (dto.SlotMachineId !== undefined) {
      SlotSession.SlotMachineId = dto.SlotMachineId;
    }
    if (dto.Status !== undefined) {
      SlotSession.Status = dto.Status;
    }
    if (dto.StartedAt !== undefined) {
      SlotSession.StartedAt = new Date(dto.StartedAt);
    }
    if (dto.LastInteractionAt !== undefined) {
      SlotSession.LastInteractionAt = new Date(dto.LastInteractionAt);
    }
    if (dto.EndedAt !== undefined) {
      SlotSession.EndedAt = dto.EndedAt ? new Date(dto.EndedAt) : null;
    }
    if (dto.CurrentRewardSnapshot !== undefined) {
      SlotSession.CurrentRewardSnapshot = dto.CurrentRewardSnapshot;
    }
    if (dto.CurrentSpinResult !== undefined) {
      SlotSession.CurrentSpinResult = dto.CurrentSpinResult;
    }
    if (dto.CurrentRerollsSpent !== undefined) {
      SlotSession.CurrentRerollsSpent = dto.CurrentRerollsSpent;
    }

    return this.SlotSessionRepo.save(SlotSession);
  }

  async remove(id: number): Promise<void> {
    const SlotSession = await this.findOne(id);
    await this.SlotSessionRepo.remove(SlotSession);
  }
}
