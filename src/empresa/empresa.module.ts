import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchama } from './schemas/empresa.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports:[MongooseModule.forFeature([{name:Empresa.name, schema:EmpresaSchama}],NombreBdConexion.mia)],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports:[EmpresaService]
})
export class EmpresaModule {}
