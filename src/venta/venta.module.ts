import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DetalleVenta, DetalleVentaSchema, Venta, VentaSchema } from './schemas/venta.schema';
import { SucursalModule } from 'src/sucursal/sucursal.module';

@Module({
  imports:[MongooseModule.forFeature([
    {name:Venta.name, schema:VentaSchema},
    {name:DetalleVenta.name, schema:DetalleVentaSchema}
  ]), SucursalModule],
  controllers: [VentaController],
  providers: [VentaService],
})
export class VentaModule {}
