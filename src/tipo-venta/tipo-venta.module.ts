import { Module } from '@nestjs/common';
import { TipoVentaService } from './tipo-venta.service';
import { TipoVentaController } from './tipo-venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoVenta, TipoVentaSchema } from './schemas/tipo-venta.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports :[MongooseModule.forFeature([
    
    {name:TipoVenta.name, schema:TipoVentaSchema}],NombreBdConexion.oc)],
  controllers: [TipoVentaController],
  providers: [TipoVentaService],
  exports:[TipoVentaService]
})
export class TipoVentaModule {}
