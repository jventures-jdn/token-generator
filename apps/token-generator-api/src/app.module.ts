import { Module } from '@nestjs/common';
import { ContractModule } from './modules/contract/contract.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '@jventures-jdn/config-consts';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ContractModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      load: [EnvironmentConfig],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short', // 10 req/s
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 30, // 30 req/10s
      },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
