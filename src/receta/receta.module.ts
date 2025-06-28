import { Module } from '@nestjs/common';
import { RecetaService } from './receta.service';
import { RecetaController } from './receta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { Receta, recetaSchema } from './schema/receta.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Receta.name, schema: recetaSchema }],
      NombreBdConexion.oc,
    ),
  ],
  controllers: [RecetaController],
  providers: [RecetaService],
  exports: [RecetaService],
})
export class RecetaModule {}
