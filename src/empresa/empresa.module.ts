import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchama } from './schemas/empresa.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:Empresa.name, schema:EmpresaSchama}])],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports:[EmpresaService]
})
export class EmpresaModule {}
