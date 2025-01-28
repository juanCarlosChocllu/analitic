import { Module } from '@nestjs/common';
import { AsesoresService } from './asesores.service';

import { MongooseModule } from '@nestjs/mongoose';

import { AsesorExcel, AsesorExcelSchema } from './schemas/asesore.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Module({
  imports :[
    MongooseModule.forFeature([
      {
      name:AsesorExcel.name ,schema:AsesorExcelSchema
    }], NombreBdConexion.oc)
  ],

  providers: [AsesoresService],
  exports:[AsesoresService]
})
export class AsesoresModule {}
