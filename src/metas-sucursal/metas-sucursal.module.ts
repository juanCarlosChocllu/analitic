import { Module } from '@nestjs/common';
import { MetasSucursalService } from './services/metas-sucursal.service';
import { MetasSucursalController } from './controllers/metas-sucursal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MetasSucursal, metasSucursalSchema } from './schema/metas-sucursal.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { CoreModule } from 'src/core/core.module';
import { DiasMetasSucursal, diasMetasSucursalSchema } from './schema/diasMetaSucursal.schema';
import { DiasMetaService } from './services/diaMeta.service';


@Module({
    imports:[

      MongooseModule.forFeature([
      {
        name:MetasSucursal.name, schema: metasSucursalSchema
      },
      {
        name:DiasMetasSucursal.name, schema: diasMetasSucursalSchema
      }
      ],NombreBdConexion.oc ),

      CoreModule
    ],
  controllers: [MetasSucursalController],
  providers: [MetasSucursalService, DiasMetaService],
  exports: [MetasSucursalService]
})
export class MetasSucursalModule {}
