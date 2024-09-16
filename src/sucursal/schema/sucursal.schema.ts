import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'Sucursal' })
export class Sucursal {
  _id: Types.ObjectId;
  sucursal: string;
  nombre: string;
  preciosVenta: string[];
}

export const sucursalSchema = SchemaFactory.createForClass(Sucursal);
