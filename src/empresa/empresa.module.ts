import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from './schemas/empresa.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Empresa.name, schema: EmpresaSchema }],
      NombreBdConexion.oc,
    ),
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
