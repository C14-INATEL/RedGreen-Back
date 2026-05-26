import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GambitTable } from './table/domain/gambit-table.entity';
import { GambitSession } from './session/domain/gambit-session.entity';
import { GambitTableService } from './table/application/gambit-table.service';
import { GambitSessionService } from './session/application/gambit-session.service';
import { GambitTableController } from './table/presentation/gambit-table.controller';
import { GambitSessionController } from './session/presentation/gambit-session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GambitTable, GambitSession])],
  providers: [GambitTableService, GambitSessionService],
  controllers: [GambitTableController, GambitSessionController],
  exports: [GambitTableService, GambitSessionService],
})
export class GambitModule {}
