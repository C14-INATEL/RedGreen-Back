import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiveSession } from './domain/active-session.entity';
import { SessionRegistryService } from './application/session-registry.service';
import { SessionsController } from './presentation/sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActiveSession])],
  providers: [SessionRegistryService],
  controllers: [SessionsController],
  exports: [SessionRegistryService],
})
export class SessionsModule {}
