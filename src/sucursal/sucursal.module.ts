import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SuscursalExcel, SuscursalExcelSchema } from './schema/sucursal.schema';

import { EmpresaExcel, EmpresaExcelSchema } from 'src/empresa/schemas/empresa.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
      
        { name: SuscursalExcel.name, schema: SuscursalExcelSchema },
        { name: EmpresaExcel.name, schema: EmpresaExcelSchema }
      
      
      
      ],
      NombreBdConexion.oc,
    ),
  ],
  controllers: [SucursalController],
  providers: [SucursalService],
  exports: [SucursalService],
})
export class SucursalModule {}
