import { forwardRef, Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VentaExcel,
  VentaExcelSchema,
} from './schemas/venta.schema';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

import { TipoVentaModule } from 'src/tipo-venta/tipo-venta.module';

import { SuscursalExcel, SuscursalExcelSchema } from 'src/sucursal/schema/sucursal.schema';
import { EmpresaExcel, EmpresaExcelSchema } from 'src/empresa/schemas/empresa.schema';
import { AbonoModule } from 'src/abono/abono.module';
import { EmpresaModule } from 'src/empresa/empresa.module';
import { VentaKpiService } from './venta.kpi.service';
import { VentaGestionService } from './venta.gestion.service';
import { AsesorExcel, AsesorExcelSchema } from 'src/asesores/schemas/asesore.schema';
import { AsesoresModule } from 'src/asesores/asesores.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [
        { name: SuscursalExcel.name, schema: SuscursalExcelSchema },
        { name: VentaExcel.name, schema: VentaExcelSchema },
        { name: EmpresaExcel.name, schema: EmpresaExcelSchema },

      ],
      NombreBdConexion.oc,
    ),

    TipoVentaModule,
    SucursalModule,
    EmpresaModule,
    AsesoresModule,
    forwardRef(()=> AbonoModule)
 
  ],
  controllers: [VentaController],
  providers: [VentaService, VentaKpiService, VentaGestionService],

  exports: [VentaService],
})
export class VentaModule {}
