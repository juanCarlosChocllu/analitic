import { Module } from '@nestjs/common';
import { TratamientoService } from './tratamiento.service';
import { TratamientoController } from './tratamiento.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tratamiento, TratamientoSchema } from './schema/tratamiento.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Tratamiento.name,
          schema: TratamientoSchema,
        },
      ],
      NombreBdConexion.oc,
    ),
  ],
  controllers: [TratamientoController],
  providers: [TratamientoService],
  exports: [TratamientoService],
})
export class TratamientoModule {}
