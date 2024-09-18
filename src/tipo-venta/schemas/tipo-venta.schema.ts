import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class TipoVenta {
  @Prop()
  nombre: string;

  @Prop()
  abreviatura:string
}
export const TipoVentaSchema = SchemaFactory.createForClass(TipoVenta);
