import { Module} from '@nestjs/common';
import { VentaModule } from './venta/venta.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoVentaModule } from './tipo-venta/tipo-venta.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { EmpresaModule } from './empresa/empresa.module';
import { ProductosModule } from './productos/productos.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [ 
    MongooseModule.forRoot('mongodb://localhost:27017/nombre_bd'), VentaModule, TipoVentaModule, SucursalModule, EmpresaModule, ProductosModule, ProvidersModule,],
  controllers: [],
  providers: [],
})
export class AppModule{}


