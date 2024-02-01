import { RedisConfig, redisConfig } from '@jventures-jdn/config-consts';
import {
  BullModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import RedisMemoryServer from 'redis-memory-server';

/* ---------------------------- BullConfigFactory --------------------------- */
@Injectable()
export class BullConfigFactory implements SharedBullConfigurationFactory {
  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: redisConfig.redis,
      defaultJobOptions: redisConfig.bull.defaultJobOptions,
    };
  }
}

/* ---------------------- BullUsingInMemoryRedisFactory --------------------- */
@Injectable()
export class BullUsingInMemoryRedisFactory
  implements SharedBullConfigurationFactory
{
  private redisServer;

  async createSharedConfiguration(): Promise<BullModuleOptions> {
    // Use common setting. Same Redis will be used for CachingModule and Bull
    const logger = new Logger('NestFactory');
    const redisConfig = RedisConfig();
    const port = redisConfig.redis.port;
    const host = redisConfig.redis.host;
    const useInMemoryRedis = redisConfig.redis.useInMemoryRedis;

    if (!useInMemoryRedis) {
      logger.log('Using local machine redis...');
      const bullConfigService = new BullConfigFactory();
      return bullConfigService.createSharedConfiguration();
    }

    logger.log(`Start Redis in-memory server (${host}:${port}) ...`);
    logger.verbose(
      `⚠️  Note that Redis in-memory server queues will disappear after restarting or hot-reloading server`,
    );
    this.redisServer = new RedisMemoryServer({
      instance: {
        port,
        ip: host,
      },
    });

    if (this.redisServer.getInstanceInfo()) {
      await this.redisServer.stop();
    }

    // Starts and binds new RedisMemoryServer to specified host and port in instance{}
    await this.redisServer.getHost();
    await this.redisServer.getPort();

    return {
      redis: {
        host,
        port,
      },
      defaultJobOptions: redisConfig.bull.defaultJobOptions,
    };
  }
}
