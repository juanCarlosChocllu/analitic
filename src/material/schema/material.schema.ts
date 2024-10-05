import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Material {
    @Prop()
    nombre:string
}

export const materialSchema= SchemaFactory.createForClass(Material)