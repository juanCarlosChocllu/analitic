import { Module } from '@nestjs/common';
import { OftalmologoService } from './oftalmologo.service';
import { OftalmologoController } from './oftalmologo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Oftalmologo ,oftalmologoSchema} from './schemas/oftalmologo.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports:[
    MongooseModule.forFeature([
    {
      name:Oftalmologo.name, schema: oftalmologoSchema
    }
    ],NombreBdConexion.oc )
  ],
  controllers: [OftalmologoController],
  providers: [OftalmologoService],
  exports:[OftalmologoService]
})
export class OftalmologoModule {}
