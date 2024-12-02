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
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

import { TipoVentaModule } from 'src/tipo-venta/tipo-venta.module';

import { SuscursalExcel, SuscursalExcelSchema } from 'src/sucursal/schema/sucursal.schema';
import { EmpresaExcel, EmpresaExcelSchema } from 'src/empresa/schemas/empresa.schema';
import { AbonoModule } from 'src/abono/abono.module';
import { EmpresaModule } from 'src/empresa/empresa.module';
import { VentaLenteService } from './services/venta.lente.service';
import { VentaGestionService } from './services/venta.gestion.service';

import { AsesoresModule } from 'src/asesores/asesores.module';
import { VentaMedicosService } from './services/venta.medicos.service';
import { VentaGestionController } from './controllers/venta.gestion.controller';
import { VentaMedicosController } from './controllers/venta.medicos.controller';
import { VentaLenteController } from './controllers/venta.lente.controller';
import { VentaProductosService } from './services/venta.productos.service';
import { VentaProductosController } from './controllers/venta.productos.controller';


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
  controllers: [VentaController, VentaGestionController, VentaMedicosController, VentaLenteController, VentaProductosController],
  providers: [VentaService, VentaLenteService, VentaGestionService, VentaMedicosService, VentaProductosService],

  exports: [VentaService],
})
export class VentaModule {}
