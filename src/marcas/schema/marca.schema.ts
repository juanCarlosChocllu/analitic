import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({collection:'Marca'})
export class Marca {
    @Prop()
    nombre:string
}


export const marcaSchema= SchemaFactory.createForClass(Marca)
