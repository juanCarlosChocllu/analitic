import { Module} from '@nestjs/common';
import { VentaModule } from './venta/venta.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoVentaModule } from './tipo-venta/tipo-venta.module';
import { SucursalModule } from './sucursal/sucursal.module';

@Module({
  imports: [ MongooseModule.forRoot('mongodb://localhost:27017/nombre_bd'), VentaModule, TipoVentaModule, SucursalModule],
  controllers: [],
  providers: [],
})
export class AppModule{}


