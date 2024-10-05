import { Module } from '@nestjs/common';
import { MarcaLenteService } from './marca-lente.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MarcaLente, MarcaLenteSchema } from './schema/marca-lente.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:MarcaLente.name, schema:MarcaLenteSchema
      }
    ], NombreBdConexion.oc)
  ],
  controllers: [],
  providers: [MarcaLenteService],
  exports:[MarcaLenteService]
})
export class MarcaLenteModule {}
