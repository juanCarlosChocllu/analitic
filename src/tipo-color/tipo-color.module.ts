import { Module } from '@nestjs/common';
import { TipoColorService } from './tipo-color.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoColor, tipoColorSchema } from './schema/tipo-color.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:TipoColor.name, schema:tipoColorSchema
      }
    ], NombreBdConexion.oc)
  ],
  controllers: [],
  providers: [TipoColorService],
  exports:[TipoColorService]
})
export class TipoColorModule {}
