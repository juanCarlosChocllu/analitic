import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class TipoVenta {
    @Prop()
    nombre:string
}
export const TipoVentaSchema= SchemaFactory.createForClass(TipoVenta)


