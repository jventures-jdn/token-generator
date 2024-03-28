import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { ContractProducer } from './contract.producer';
import { BullModule } from '@nestjs/bull';

@Module({
  controllers: [ContractController],
  providers: [ContractService, ContractProducer],
  imports: [
    BullModule.registerQueue({
      name: 'contract',
    }),
  ],
})
export class ContractModule {}
