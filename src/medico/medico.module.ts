import { Module } from '@nestjs/common';
import { MedicoService } from './medico.service';
import { MedicoController } from './medico.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Medico, medicoShema } from './schema/medico.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Module({
      imports:[
         MongooseModule.forFeature([
         {
           name:Medico.name, schema: medicoShema
         }
         ],NombreBdConexion.oc )
       ],
  controllers: [MedicoController],
  providers: [MedicoService],
  exports: [MedicoService],
})
export class MedicoModule {}
