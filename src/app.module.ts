import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        const host = config.get<string>('POSTGRES_HOST', 'localhost');
        const port = parseInt(config.get<string>('POSTGRES_PORT', '5433'), 10);
        const username = config.get<string>('POSTGRES_USER');
        const password = config.get<string>('POSTGRES_PASSWORD');
        const database = config.get<string>('POSTGRES_DB');

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
          synchronize: false,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
