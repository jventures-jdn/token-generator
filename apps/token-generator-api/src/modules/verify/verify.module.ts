import { Module } from '@nestjs/common';
import { VerifyController } from './verify.controller';

@Module({
  imports: [],
  controllers: [VerifyController],
  providers: [],
  exports: [],
})
export class VerifyModule {}
