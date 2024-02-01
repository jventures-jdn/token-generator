import { Module } from '@nestjs/common';
import { ContractModule } from './modules/contract/contract.module';
import { ConfigModule } from '@nestjs/config';
import { BullUsingInMemoryRedisFactory } from './shared/bull.factory';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import {
  EnvironmentConfig,
  RedisConfig,
  SystemConfig,
  systemConfig,
} from '@jventures-jdn/config-consts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      load: [EnvironmentConfig, SystemConfig, RedisConfig],
    }),
    ThrottlerModule.forRoot(systemConfig.rateLimit),
    BullModule.forRootAsync({
      useClass: BullUsingInMemoryRedisFactory,
    }),
    ContractModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
