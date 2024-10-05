import { Module } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Marca, marcaSchema } from './schema/marca.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:Marca.name, schema:marcaSchema
      }
    ], NombreBdConexion.oc)
  ],
  controllers: [],
  providers: [MarcasService],
  exports:[MarcasService]
})
export class MarcasModule {}
