import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({collection:'MarcaLente'})
export class MarcaLente {
    @Prop()
    nombre:string
}


export const MarcaLenteSchema= SchemaFactory.createForClass(MarcaLente)