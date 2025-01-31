import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({collection:'Rango'})
export class Rango {
    @Prop()
    nombre:string
    
}


export const rangoSchema= SchemaFactory.createForClass(Rango)
