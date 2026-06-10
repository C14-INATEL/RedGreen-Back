import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GambitTable } from '../domain/gambit-table.entity';
import { CreateGambitTableDto } from '../domain/dto/create-gambit-table.dto';
import { UpdateGambitTableDto } from '../domain/dto/update-gambit-table.dto';
import {
  GambitSession,
  GambitSessionStatus,
} from '../sessions/domain/gambit-session.entity';

@Injectable()
export class GambitTableService {
  constructor(
    @InjectRepository(GambitTable)
    private readonly GambitTableRepo: Repository<GambitTable>,
    @InjectRepository(GambitSession)
    private readonly GambitSessionRepo: Repository<GambitSession>
  ) {}

  async Create(DTO: CreateGambitTableDto): Promise<GambitTable> {
    const GambitTable = this.GambitTableRepo.create(DTO);
    return this.GambitTableRepo.save(GambitTable);
  }

  async FindAll(): Promise<GambitTable[]> {
    return this.GambitTableRepo.find();
  }

  async FindOne(Id: number): Promise<GambitTable> {
    const GambitTable = await this.GambitTableRepo.findOneBy({
      GambitTableId: Id,
    });
    if (!GambitTable) {
      throw new NotFoundException(`GambitTable with ID ${Id} not found`);
    }
    return GambitTable;
  }

  async Update(Id: number, DTO: UpdateGambitTableDto): Promise<GambitTable> {
    const GambitTable = await this.FindOne(Id);

    if (DTO.Name !== undefined) GambitTable.Name = DTO.Name;
    if (DTO.Description !== undefined)
      GambitTable.Description = DTO.Description;
    if (DTO.MinimumChipsRequired !== undefined)
      GambitTable.MinimumChipsRequired = DTO.MinimumChipsRequired;
    if (DTO.CardPrice !== undefined) GambitTable.CardPrice = DTO.CardPrice;
    if (DTO.TableMultiplier !== undefined)
      GambitTable.TableMultiplier = DTO.TableMultiplier;
    if (DTO.MinimumCardsPurchased !== undefined)
      GambitTable.MinimumCardsPurchased = DTO.MinimumCardsPurchased;
    if (DTO.MaxCardsPurchased !== undefined)
      GambitTable.MaxCardsPurchased = DTO.MaxCardsPurchased;

    return this.GambitTableRepo.save(GambitTable);
  }

  async Remove(Id: number): Promise<void> {
    const GambitTable = await this.FindOne(Id);

    const ActiveSession = await this.GambitSessionRepo.findOne({
      where: { GambitTableId: Id, Status: GambitSessionStatus.InProgress },
    });

    if (ActiveSession) {
      throw new BadRequestException(
        `Cannot deactivate GambitTable ${Id} while there are active sessions`
      );
    }

    GambitTable.Active = false;
    await this.GambitTableRepo.save(GambitTable);
  }
}
