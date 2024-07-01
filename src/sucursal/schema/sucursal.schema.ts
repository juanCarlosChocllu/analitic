import { Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({collection:'Sucursal'})
export class Sucursal {

}

export const sucursalSchema = SchemaFactory.createForClass(Sucursal)