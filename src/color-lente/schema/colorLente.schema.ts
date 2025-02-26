

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({collection:'ColorLente'})
export class ColorLente {
        @Prop()
        nombre:string
}

export const colorLenteSchema= SchemaFactory.createForClass(ColorLente)