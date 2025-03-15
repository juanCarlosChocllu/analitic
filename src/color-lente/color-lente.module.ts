import { Module } from '@nestjs/common';
import { ColorLenteService } from './color-lente.service';
import { ColorLenteController } from './color-lente.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ColorLente, colorLenteSchema } from './schema/colorLente.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Module({
   imports:[
      MongooseModule.forFeature([
        {
          name:ColorLente.name, schema:colorLenteSchema
        }
      ], NombreBdConexion.oc)
    ],
  controllers: [ColorLenteController],
  providers: [ColorLenteService],
  exports:[ColorLenteService]
})
export class ColorLenteModule {}
