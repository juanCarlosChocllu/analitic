import { Module } from '@nestjs/common';
import { AsesoresService } from './asesores.service';

import { MongooseModule } from '@nestjs/mongoose';


import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { Asesor, AsesorSchema } from './schemas/asesore.schema';

@Module({
  imports :[
    MongooseModule.forFeature([
      {
      name:Asesor.name ,schema:AsesorSchema
    }], NombreBdConexion.oc)
  ],

  providers: [AsesoresService],
  exports:[AsesoresService]
})
export class AsesoresModule {}
