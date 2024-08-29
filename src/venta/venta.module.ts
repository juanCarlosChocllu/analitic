import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AsesorExcel, AsesorExcelSchema, DetalleVenta, DetalleVentaSchema, EmpresaExcel, EmpresaExcelSchema, SuscursalExcel, SuscursalExcelSchema, Venta, VentaExcel, VentaExcelSchema, VentaSchema } from './schemas/venta.schema';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { ProvidersModule } from 'src/providers/providers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';


@Module({
  imports:[
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
    {name:Venta.name, schema:VentaSchema},
    {name:DetalleVenta.name, schema:DetalleVentaSchema},
    {name:VentaExcel.name, schema:VentaExcelSchema},
  ],NombreBdConexion.mia), 
  
    MongooseModule.forFeature([
      {name:SuscursalExcel.name, schema:SuscursalExcelSchema},
      {name:VentaExcel.name, schema:VentaExcelSchema},
      {name:EmpresaExcel.name, schema:EmpresaExcelSchema},
      {name:AsesorExcel.name, schema:AsesorExcelSchema},
    ], NombreBdConexion.oc ),

  SucursalModule, ProvidersModule],
  controllers: [VentaController],
  providers: [VentaService],
  exports:[]
})
export class VentaModule {}
