import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: 'TipoVenta' })
export class TipoVenta {
}
export const TipoVentaSchema= SchemaFactory.createForClass(TipoVenta)


