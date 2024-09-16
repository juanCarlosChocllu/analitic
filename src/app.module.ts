import { forwardRef, Module } from '@nestjs/common';
import { VentaModule } from './venta/venta.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoVentaModule } from './tipo-venta/tipo-venta.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { EmpresaModule } from './empresa/empresa.module';
import { ProductosModule } from './productos/productos.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProvidersModule } from './providers/providers.module';
import { NombreBdConexion } from './enums/nombre.db.enum';
import { AbonoModule } from './abono/abono.module';
import { TratamientoModule } from './tratamiento/tratamiento.module';
import { TipoLenteModule } from './tipo-lente/tipo-lente.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nombre_bd', {
      connectionName: NombreBdConexion.mia,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/analitic', {
      connectionName: NombreBdConexion.oc,
    }),
    VentaModule,
    TipoVentaModule,
    SucursalModule,
    EmpresaModule,
    ProductosModule,
    ProvidersModule,
    AbonoModule,
    TratamientoModule,
    TipoLenteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
