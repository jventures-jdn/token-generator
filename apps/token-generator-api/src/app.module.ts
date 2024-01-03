import { Module } from '@nestjs/common';
import { VerifyModule } from './modules/verify/verify.module';

@Module({
  imports: [VerifyModule],
})
export class AppModule {}
