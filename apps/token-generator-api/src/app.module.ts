import { Module } from '@nestjs/common';
import { ContractModule } from './modules/contract/contract.module';

@Module({
  imports: [ContractModule],
})
export class AppModule {}
