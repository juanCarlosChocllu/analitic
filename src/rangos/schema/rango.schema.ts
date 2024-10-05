import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Rango {
    @Prop()
    nombre:string
    
}


export const rangoSchema= SchemaFactory.createForClass(Rango)
