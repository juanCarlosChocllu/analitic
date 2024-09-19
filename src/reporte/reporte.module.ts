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
import { AsesorExcel, AsesorExcelSchema,VentaExcel, VentaExcelSchema   } from 'src/venta/schemas/venta.schema';
import { Abono, AbonoSchema } from 'src/abono/schema/abono.abono';
import { SuscursalExcel, SuscursalExcelSchema } from 'src/sucursal/schema/sucursal.schema';
import { EmpresaExcel, EmpresaExcelSchema } from 'src/empresa/schemas/empresa.schema';

@Module({
  imports:[
    MongooseModule.forFeature(
      [
        { name: SuscursalExcel.name, schema: SuscursalExcelSchema },
        { name: VentaExcel.name, schema: VentaExcelSchema },
        { name: AsesorExcel.name, schema: AsesorExcelSchema },
        { name: Abono.name, schema: AbonoSchema },
      ],
      NombreBdConexion.oc,
    ),
    SucursalModule,
    ProvidersModule,
    TipoVentaModule,
    TratamientoModule,
    TipoLenteModule
  ],
  controllers: [ReporteController],
  providers: [ReporteService],
})
export class ReporteModule {}
