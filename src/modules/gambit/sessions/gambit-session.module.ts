import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GambitSessionController } from './presentation/gambit-session.controller';
import { GambitCurrentSessionController } from './presentation/gambit-current-session.controller';
import { GambitSessionService } from './application/gambit-session.service';
import { GambitSession } from './domain/gambit-session.entity';
import { GambitTable } from '../domain/gambit-table.entity';
import { User } from '../../auth/domain/user.entity';
import { AuthModule } from '../../auth/auth.module';
import { GambitModule } from '../gambit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GambitSession, GambitTable, User]),
    AuthModule,
    GambitModule,
  ],
  providers: [GambitSessionService],
  controllers: [GambitSessionController, GambitCurrentSessionController],
  exports: [GambitSessionService],
})
export class GambitSessionModule {}
