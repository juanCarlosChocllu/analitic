import { Module } from '@nestjs/common';
import { TipoVentaService } from './tipo-venta.service';
import { TipoVentaController } from './tipo-venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoVenta, TipoVentaSchema } from './schemas/tipo-venta.schema';

@Module({
  imports :[MongooseModule.forFeature([{name:TipoVenta.name, schema:TipoVentaSchema}])],
  controllers: [TipoVentaController],
  providers: [TipoVentaService],
})
export class TipoVentaModule {}
