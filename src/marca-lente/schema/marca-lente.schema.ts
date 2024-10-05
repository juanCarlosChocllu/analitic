import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class MarcaLente {
    @Prop()
    nombre:string
}


export const MarcaLenteSchema= SchemaFactory.createForClass(MarcaLente)