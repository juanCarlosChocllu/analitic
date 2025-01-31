import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({collection:'TipoColor'})
export class TipoColor {
    @Prop()
    nombre:string
}


export const tipoColorSchema= SchemaFactory.createForClass(TipoColor)