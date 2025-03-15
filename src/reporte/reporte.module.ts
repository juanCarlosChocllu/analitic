import { Module } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { ReporteController } from './reporte.controller';
import { TipoLenteModule } from 'src/tipo-lente/tipo-lente.module';
import { TratamientoModule } from 'src/tratamiento/tratamiento.module';
import { ProvidersModule } from 'src/providers/providers.module';
import { TipoVentaModule } from 'src/tipo-venta/tipo-venta.module';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { MongooseModule } from '@nestjs/mongoose';

import { Venta, VentaSchema   } from 'src/venta/schemas/venta.schema';
import { Abono, AbonoSchema } from 'src/abono/schema/abono.abono';
import { Sucursal, SuscursalSchema } from 'src/sucursal/schema/sucursal.schema';

import { MaterialModule } from 'src/material/material.module';

import { TipoColorModule } from 'src/tipo-color/tipo-color.module';
import { MarcasModule } from 'src/marcas/marcas.module';
import { MarcaLenteModule } from 'src/marca-lente/marca-lente.module';
import { ScheduleModule } from '@nestjs/schedule';

import { VentaModule } from 'src/venta/venta.module';

import { AsesoresModule } from 'src/asesores/asesores.module';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { ColorLenteModule } from 'src/color-lente/color-lente.module';
import { MedicoModule } from 'src/medico/medico.module';
import { LogModule } from 'src/log/log.module';

@Module({
  imports:[
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [
        { name: Sucursal.name, schema: SuscursalSchema },
        { name: Venta.name, schema: VentaSchema },
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
    MedicoModule,
    SucursalModule,
    AsesoresModule,
    ColorLenteModule,
    LogModule,
  ],
  controllers: [ReporteController],
  providers: [ReporteService],
})
export class ReporteModule {}
