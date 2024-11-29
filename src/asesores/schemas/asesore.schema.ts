import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class AsesorExcel {
  @Prop()
  usuario: string;

  @Prop({ type: Types.ObjectId, ref: 'SuscursalExcel' })
  sucursal: Types.ObjectId;
}

export const AsesorExcelSchema = SchemaFactory.createForClass(AsesorExcel);
