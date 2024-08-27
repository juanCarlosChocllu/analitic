import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Producto ,ProductoSchema} from './schema/producto.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports:[MongooseModule.forFeature([{name:Producto.name, schema:ProductoSchema}],NombreBdConexion.mia)],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
