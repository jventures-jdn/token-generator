import { Module } from '@nestjs/common';
import { ContractModule } from './modules/contract/contract.module';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentConfig } from '@jventures-jdn/config-consts';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ContractModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development'],
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
  ],
})
export class AppModule {}
