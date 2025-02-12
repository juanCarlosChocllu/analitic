import { forwardRef, Module } from '@nestjs/common';
import { VentaService } from './services/venta.service';
import { VentaController  } from './controllers/venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
Venta,
VentaSchema
} from './schemas/venta.schema';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { ScheduleModule } from '@nestjs/schedule';


import { TipoVentaModule } from 'src/tipo-venta/tipo-venta.module';

import { Sucursal, SuscursalSchema } from 'src/sucursal/schema/sucursal.schema';
import { AbonoModule } from 'src/abono/abono.module';
import { EmpresaModule } from 'src/empresa/empresa.module';
import { VentaLenteService } from './lente/services/venta.lente.service';


import { AsesoresModule } from 'src/asesores/asesores.module';
import { VentaMedicosService } from './medicos/services/venta.medicos.service';

import { VentaMedicosController } from './medicos/controllers/venta.medicos.controller';
import { VentaLenteController } from './lente/controllers/venta.lente.controller';
import { VentaProductosService } from './productos/services/venta.productos.service';
import { VentaProductosController } from './productos/controllers/venta.productos.controller';
import { OftalmologoModule } from 'src/oftalmologo/oftalmologo.module';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { VentaMestasSucursalController } from './metasSucursal/controllers/ventaMetasSucursal.controller';
import { VentaMetasSucursalService } from './metasSucursal/services/VentaMetasSucursal.service';
import { MetasSucursalModule } from 'src/metas-sucursal/metas-sucursal.module';
import { CoreService } from './core/service/core.service';
import { VentaAsesoresController } from './asesores/controllers/ventaAsesores.controller';
import { VentaAsesoresService } from './asesores/service/ventaAsesores.service';
import { DiasModule } from 'src/dias/dias.module';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [
        { name: Sucursal.name, schema: SuscursalSchema },
        { name: Venta.name, schema: VentaSchema },


      ],
      NombreBdConexion.oc,
    ),

    TipoVentaModule,
    SucursalModule,
    EmpresaModule,
    AsesoresModule,
    OftalmologoModule,
    MetasSucursalModule,
    forwardRef(()=> AbonoModule),
    DiasModule,
   
 
  ],
  controllers: [VentaController, 
    VentaAsesoresController, 
    VentaMedicosController,
     VentaLenteController,
      VentaProductosController,
      VentaMestasSucursalController
    ],
  providers: [VentaService, VentaLenteService, VentaAsesoresService,
     VentaMedicosService,
      VentaProductosService,
    VentaMetasSucursalService,
    CoreService
    ],

  exports: [VentaService],
})
export class VentaModule {}
