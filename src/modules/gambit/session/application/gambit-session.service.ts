import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GambitSession,
  GambitSessionStatus,
} from '../domain/gambit-session.entity';
import { CreateGambitSessionDto } from '../domain/dto/create-gambit-session.dto';
import { UpdateGambitSessionDto } from '../domain/dto/update-gambit-session.dto';

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
    });
    return this.GambitSessionRepo.save(GambitSession);
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
