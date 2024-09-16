import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Abono {
  @Prop()
  numeroTicket: string;

  @Prop({ type: Types.ObjectId, ref: 'VentaExcel' })
  venta: Types.ObjectId;

  @Prop()
  monto: number;

  @Prop()
  fecha: Date;

  @Prop()
  flag: string;

  @Prop({ type: Date, default: Date.now() })
  fechaCreacion: Date;
}

export const AbonoSchema = SchemaFactory.createForClass(Abono);
