import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({collection:'Sucursal'})
export class Sucursal {
  @Prop()
  nombre: string;
  @Prop({ type: Types.ObjectId, ref: 'Empresa' })
  empresa: Types.ObjectId;
}

export const SuscursalSchema =
  SchemaFactory.createForClass(Sucursal);
