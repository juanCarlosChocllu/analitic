import { forwardRef, Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AsesorExcel,
  AsesorExcelSchema,
  EmpresaExcel,
  EmpresaExcelSchema,
  VentaExcel,
  VentaExcelSchema,
} from './schemas/venta.schema';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { ProvidersModule } from 'src/providers/providers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { Abono, AbonoSchema } from 'src/abono/schema/abono.abono';
import { TipoVentaModule } from 'src/tipo-venta/tipo-venta.module';
import { TratamientoModule } from 'src/tratamiento/tratamiento.module';
import { TipoLenteModule } from 'src/tipo-lente/tipo-lente.module';
import { SuscursalExcel, SuscursalExcelSchema } from 'src/sucursal/schema/sucursal.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [{ name: VentaExcel.name, schema: VentaExcelSchema }],
      NombreBdConexion.mia,
    ),

    MongooseModule.forFeature(
      [
        { name: SuscursalExcel.name, schema: SuscursalExcelSchema },
        { name: VentaExcel.name, schema: VentaExcelSchema },
        { name: EmpresaExcel.name, schema: EmpresaExcelSchema },
        { name: AsesorExcel.name, schema: AsesorExcelSchema },
        { name: Abono.name, schema: AbonoSchema },
      ],
      NombreBdConexion.oc,
    ),

    TipoVentaModule,
    SucursalModule
 
  ],
  controllers: [VentaController],
  providers: [VentaService],

  exports: [VentaService],
})
export class VentaModule {}
