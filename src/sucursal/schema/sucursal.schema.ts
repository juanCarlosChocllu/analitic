import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({collection:'Sucursal'})
export class SuscursalExcel {
  @Prop()
  nombre: string;
  @Prop({ type: Types.ObjectId, ref: 'EmpresaExcel' })
  empresa: Types.ObjectId;
}

export const SuscursalExcelSchema =
  SchemaFactory.createForClass(SuscursalExcel);
