import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sucursal, sucursalSchema } from './schema/sucursal.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports:[MongooseModule.forFeature([{name: Sucursal.name, schema:sucursalSchema}],NombreBdConexion.mia)],
  controllers: [SucursalController],
  providers: [SucursalService],
  exports:[SucursalService]
})
export class SucursalModule {}
