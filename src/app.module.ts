import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SlotMachineModule } from './modules/slot-machine/slot-machine.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (Config: ConfigService) => {
        const host = Config.get<string>('POSTGRES_HOST', 'localhost');
        const port = parseInt(Config.get<string>('POSTGRES_PORT', '5433'), 10);
        const username = Config.get<string>('POSTGRES_USER');
        const password = Config.get<string>('POSTGRES_PASSWORD');
        const database = Config.get<string>('POSTGRES_DB');

        if (!username || !password || !database) {
          throw new Error(
            'Missing required database configuration variables (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)'
          );
        }

        console.log(
          `Connecting to PostgreSQL: postgres://${username}:****@${host}:${port}/${database}`
        );

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
        };
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    AuthModule,
    SlotMachineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
