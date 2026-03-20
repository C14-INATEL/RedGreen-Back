import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GamesService } from '../application/games.service';
import { CreateGameDto } from '../domain/dto/create-game.dto';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiBody({ type: CreateGameDto })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully (returns no explicit Game schema).',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateGameDto) {
    return this.gamesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all games' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of games (no explicit response type)',
  })
  async findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a game by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns game by ID (no explicit response type)',
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async findOne(@Param('id') id: number) {
    return this.gamesService.findOne(id);
  }
}
