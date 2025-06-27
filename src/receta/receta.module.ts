import { Module } from '@nestjs/common';
import { RecetaService } from './receta.service';
import { RecetaController } from './receta.controller';

@Module({
  controllers: [RecetaController],
  providers: [RecetaService],
})
export class RecetaModule {}
