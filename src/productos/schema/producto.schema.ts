import { Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'Producto' })
export class Producto {
  tipoProducto: string;
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);
