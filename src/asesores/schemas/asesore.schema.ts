import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({collection:'Asesor'})
export class Asesor {
  @Prop()
  usuario: string;

  @Prop({ type: Types.ObjectId, ref: 'Sucursal' })
  sucursal: Types.ObjectId;
}

export const AsesorSchema = SchemaFactory.createForClass(Asesor);
