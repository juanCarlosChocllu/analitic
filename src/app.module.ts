import { forwardRef, Module } from '@nestjs/common';
import { VentaModule } from './venta/venta.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoVentaModule } from './tipo-venta/tipo-venta.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { EmpresaModule } from './empresa/empresa.module';

import { ProvidersModule } from './providers/providers.module';

import { AbonoModule } from './abono/abono.module';
import { TratamientoModule } from './tratamiento/tratamiento.module';
import { TipoLenteModule } from './tipo-lente/tipo-lente.module';
import { ReporteModule } from './reporte/reporte.module';
import { MaterialModule } from './material/material.module';
import { RangosModule } from './rangos/rangos.module';
import { MarcasModule } from './marcas/marcas.module';
import { TipoColorModule } from './tipo-color/tipo-color.module';
import { MarcaLenteModule } from './marca-lente/marca-lente.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { APP_GUARD } from '@nestjs/core';
import { TokenGuard } from './autenticacion/guard/token/token.guard';
import { LogModule } from './log/log.module';
import { ConfigModule } from '@nestjs/config';
import { databaseConeccion } from './core/config/variables.entorno.config';
import { OftalmologoModule } from './oftalmologo/oftalmologo.module';
import { AsesoresModule } from './asesores/asesores.module';
import { NombreBdConexion } from './core/enums/nombre.db.enum';

import { MetasSucursalModule } from './metas-sucursal/metas-sucursal.module';
import { CoreModule } from './core/core.module';
import { DiasModule } from './dias/dias.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    MongooseModule.forRoot(databaseConeccion, {
      connectionName: NombreBdConexion.oc,
    }),
    VentaModule,
    TipoVentaModule,
    SucursalModule,
    EmpresaModule,
    ProvidersModule,
    AbonoModule,
    TratamientoModule,
    TipoLenteModule,
    ReporteModule,
    MaterialModule,
    RangosModule,
    MarcasModule,
    TipoColorModule,
    MarcaLenteModule,
    UsuariosModule,
    AutenticacionModule,
    LogModule,
    OftalmologoModule,
    AsesoresModule,
    MetasSucursalModule,
    CoreModule,
    DiasModule
  ],
  controllers: [],
  providers: [

    {
    provide:APP_GUARD,
    useClass:TokenGuard
  }],
})
export class AppModule {}
