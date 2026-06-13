import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GambitSessionController } from './presentation/gambit-session.controller';
import { GambitCurrentSessionController } from './presentation/gambit-current-session.controller';
import { GambitSessionService } from './application/gambit-session.service';
import { GambitSession } from './domain/gambit-session.entity';
import { GambitTable } from '../domain/gambit-table.entity';
import { SessionsModule } from '../../sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GambitSession, GambitTable]),
    SessionsModule,
  ],
  providers: [GambitSessionService],
  controllers: [GambitSessionController, GambitCurrentSessionController],
  exports: [GambitSessionService],
})
export class GambitSessionModule {}
