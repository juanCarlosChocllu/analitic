import { Module } from '@nestjs/common';
import { CoreAppService } from './services/core.service';


@Module({
  controllers: [],
  providers: [CoreAppService],
  exports:[CoreAppService]
})
export class CoreModule {}
