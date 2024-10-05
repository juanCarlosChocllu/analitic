import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class TipoColor {
    @Prop()
    nombre:string
}


export const tipoColorSchema= SchemaFactory.createForClass(TipoColor)