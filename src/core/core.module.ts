import { Module } from '@nestjs/common';
import { CoreService } from './services/core.service';


@Module({
  controllers: [],
  providers: [CoreService],
  exports:[CoreService]
})
export class CoreModule {}
