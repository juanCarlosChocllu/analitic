import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Material, materialSchema } from './schema/material.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:Material.name, schema:materialSchema
      }
    ], NombreBdConexion.oc)
  ],
  controllers: [],
  providers: [MaterialService],
  exports:[MaterialService]
})
export class MaterialModule {}
