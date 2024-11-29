import { Module } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { ReporteController } from './reporte.controller';
import { TipoLenteModule } from 'src/tipo-lente/tipo-lente.module';
import { TratamientoModule } from 'src/tratamiento/tratamiento.module';
import { ProvidersModule } from 'src/providers/providers.module';
import { TipoVentaModule } from 'src/tipo-venta/tipo-venta.module';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { VentaExcel, VentaExcelSchema   } from 'src/venta/schemas/venta.schema';
import { Abono, AbonoSchema } from 'src/abono/schema/abono.abono';
import { SuscursalExcel, SuscursalExcelSchema } from 'src/sucursal/schema/sucursal.schema';

import { MaterialModule } from 'src/material/material.module';

import { TipoColorModule } from 'src/tipo-color/tipo-color.module';
import { MarcasModule } from 'src/marcas/marcas.module';
import { MarcaLenteModule } from 'src/marca-lente/marca-lente.module';
import { ScheduleModule } from '@nestjs/schedule';

import { VentaModule } from 'src/venta/venta.module';
import { OftalmologoModule } from 'src/oftalmologo/oftalmologo.module';
import { AsesoresModule } from 'src/asesores/asesores.module';

@Module({
  imports:[
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [
        { name: SuscursalExcel.name, schema: SuscursalExcelSchema },
        { name: VentaExcel.name, schema: VentaExcelSchema },
        { name: Abono.name, schema: AbonoSchema },
      ],
      NombreBdConexion.oc,
    ),
    SucursalModule,
    ProvidersModule,
    TipoVentaModule,
    TratamientoModule,
    TipoLenteModule,
    MaterialModule,
    TipoColorModule,
    MarcasModule,
    MarcaLenteModule,
    VentaModule,
    OftalmologoModule,
    SucursalModule,
    AsesoresModule
  ],
  controllers: [ReporteController],
  providers: [ReporteService],
})
export class ReporteModule {}
