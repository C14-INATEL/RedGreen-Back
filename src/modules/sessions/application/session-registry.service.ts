import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ActiveSession } from '../domain/active-session.entity';
import { GameType } from '../domain/enums/game-type.enum';

@Injectable()
export class SessionRegistryService {
  async acquire(
    manager: EntityManager,
    userId: string,
    gameType: GameType,
    refId: number
  ): Promise<void> {
    try {
      await manager.insert(ActiveSession, {
        UserId: userId,
        GameType: gameType,
        ReferenceId: refId,
      });
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError?.code === '23505') {
        throw new ConflictException(
          'Você já está em uma partida. Encerre a mesa atual antes de entrar em outra.'
        );
      }
      throw error;
    }
  }

  async release(manager: EntityManager, userId: string): Promise<void> {
    await manager.delete(ActiveSession, { UserId: userId });
  }
}
