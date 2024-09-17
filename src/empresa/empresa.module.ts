import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EmpresaExcel, EmpresaExcelSchema } from './schemas/empresa.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: EmpresaExcel.name, schema: EmpresaExcelSchema }],
      NombreBdConexion.oc,
    ),
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
