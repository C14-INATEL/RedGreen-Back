import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../domain/game.entity';
import { CreateGameDto } from '../domain/dto/create-game.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>
  ) {}

  async create(dto: CreateGameDto): Promise<Game> {
    const game = this.gameRepository.create(dto);
    return this.gameRepository.save(game);
  }

  async findAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async findOne(id: number): Promise<Game> {
    return this.gameRepository.findOneOrFail({ where: { GameId: id } });
  }
}
