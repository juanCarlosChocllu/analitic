import { Module } from '@nestjs/common';
import { RangosService } from './rangos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Rango, rangoSchema , } from './schema/rango.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Module({

  imports:[
    MongooseModule.forFeature([
      {
        name:Rango.name, schema:rangoSchema
      }
    ], NombreBdConexion.oc)
  ],
  controllers: [],
  providers: [RangosService],
  exports:[RangosService]
})
export class RangosModule {}
