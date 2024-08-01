import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DetalleVenta, DetalleVentaSchema, SuscursalExcel, SuscursalExcelSchema, Venta, VentaExcel, VentaExcelSchema, VentaSchema } from './schemas/venta.schema';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { ProvidersModule } from 'src/providers/providers.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports:[
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
    {name:Venta.name, schema:VentaSchema},
    {name:DetalleVenta.name, schema:DetalleVentaSchema},
    {name:VentaExcel.name, schema:VentaExcelSchema},
    {name:SuscursalExcel.name, schema:SuscursalExcelSchema}
  ]), SucursalModule, ProvidersModule],
  controllers: [VentaController],
  providers: [VentaService],
  exports:[]
})
export class VentaModule {}
