import { Module } from '@nestjs/common';
import { AsesoresService } from './asesores.service';

import { MongooseModule } from '@nestjs/mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { AsesorExcel, AsesorExcelSchema } from './schemas/asesore.schema';

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
