import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GambitSessionController } from './presentation/gambit-session.controller';
import { GambitSessionService } from './application/gambit-session.service';
import { GambitSession } from './domain/gambit-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GambitSession])],
  providers: [GambitSessionService],
  controllers: [GambitSessionController],
  exports: [GambitSessionService],
})
export class GambitSessionModule {}
