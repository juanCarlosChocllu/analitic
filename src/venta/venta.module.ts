import { forwardRef, Module } from '@nestjs/common';
import { VentaService } from './services/venta.service';
import { VentaController  } from './controllers/venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VentaExcel,
  VentaExcelSchema,
} from './schemas/venta.schema';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { ScheduleModule } from '@nestjs/schedule';


import { TipoVentaModule } from 'src/tipo-venta/tipo-venta.module';

import { SuscursalExcel, SuscursalExcelSchema } from 'src/sucursal/schema/sucursal.schema';
import { EmpresaExcel, EmpresaExcelSchema } from 'src/empresa/schemas/empresa.schema';
import { AbonoModule } from 'src/abono/abono.module';
import { EmpresaModule } from 'src/empresa/empresa.module';
import { VentaLenteService } from './lente/services/venta.lente.service';
import { VentaGestionService } from './services/venta.gestion.service';

import { AsesoresModule } from 'src/asesores/asesores.module';
import { VentaMedicosService } from './medicos/services/venta.medicos.service';
import { VentaGestionController } from './controllers/venta.gestion.controller';
import { VentaMedicosController } from './medicos/controllers/venta.medicos.controller';
import { VentaLenteController } from './lente/controllers/venta.lente.controller';
import { VentaProductosService } from './productos/services/venta.productos.service';
import { VentaProductosController } from './productos/controllers/venta.productos.controller';
import { OftalmologoModule } from 'src/oftalmologo/oftalmologo.module';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


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
    OftalmologoModule,
    forwardRef(()=> AbonoModule)
 
  ],
  controllers: [VentaController, VentaGestionController, VentaMedicosController, VentaLenteController, VentaProductosController],
  providers: [VentaService, VentaLenteService, VentaGestionService, VentaMedicosService, VentaProductosService],

  exports: [VentaService],
})
export class VentaModule {}
