import { Module } from '@nestjs/common';
import { MetasSucursalService } from './metas-sucursal.service';
import { MetasSucursalController } from './metas-sucursal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MetasSucursal, metasSucursalSchema } from './schema/metas-sucursal.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { CoreModule } from 'src/core/core.module';


@Module({
    imports:[

      MongooseModule.forFeature([
      {
        name:MetasSucursal.name, schema: metasSucursalSchema
      }
      ],NombreBdConexion.oc ),

      CoreModule
    ],
  controllers: [MetasSucursalController],
  providers: [MetasSucursalService],
  exports: [MetasSucursalService]
})
export class MetasSucursalModule {}
