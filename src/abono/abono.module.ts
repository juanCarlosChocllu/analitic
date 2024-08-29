import { Module } from '@nestjs/common';
import { HttpAbonoService } from './abono.service';
import { AbonoController } from './abono.controller';
import { ProvidersModule } from 'src/providers/providers.module';

@Module({
  imports:[ProvidersModule ],
  controllers: [AbonoController],
  providers: [HttpAbonoService],
})
export class AbonoModule {}
