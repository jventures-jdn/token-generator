import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { ContractProducer } from './contract.producer';
import { BullModule } from '@nestjs/bull';
import { ContractConsumer } from './contract.consumer';

@Module({
  controllers: [ContractController],
  providers: [ContractService, ContractProducer, ContractConsumer],
  imports: [
    BullModule.registerQueue({
      name: 'contract',
      defaultJobOptions: {
        removeOnComplete: 60,
        removeOnFail: 60,
        timeout: 60 * 60 * 1000, // 1hr,
        lifo: true,
      },
    }),
  ],
})
export class ContractModule {}
