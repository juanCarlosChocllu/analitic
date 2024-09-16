import { Injectable } from '@nestjs/common';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Producto } from './schema/producto.schema';
import { Model } from 'mongoose';
import { tipoProductoI } from './enums/productos.enum';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class ProductosService {
  constructor(
    @InjectModel(Producto.name, NombreBdConexion.mia)
    private readonly ProductoSchema: Model<Producto>,
  ) {}
  async buscarMontura() {
    const productoDetalle = await this.ProductoSchema.aggregate([
      {
        $project: {
          tipoProducto: 1,
        },
      },
      {
        $match: { tipoProducto: tipoProductoI.MONTURA },
      },
    ]);

    // const producto = await this.ProductoSchema.find({tipoProducto:tipoProductoI.MONTURA,flag:'nuevo'},'tipoProducto')
    return productoDetalle;
  }

  buscarGafas() {}

  buscarLentesContacto() {
    return 'hola';
  }

  findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
