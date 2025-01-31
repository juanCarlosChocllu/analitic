import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { flagVenta } from '../core/enums/flgaVenta.enum';

@Schema({collection:'Venta'})
export class Venta {
  @Prop()
  aperturaTicket: string;
  @Prop()
  numeroTicket: string;

  @Prop({ type: Types.ObjectId, ref: 'SuscursalExcel' })
  sucursal: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Empresa' })
  empresa: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AsesorExcel' })
  asesor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tratamiento' })
  tratamiento: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TipoLente' })
  tipoLente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TipoColor' })
  tipoColor: Types.ObjectId;

  
  @Prop({ type: Types.ObjectId, ref: 'Rango' })
  rango: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MarcaLente' }) //se aplica depente al rubro
  marcaLente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Marca' })//se aplica depente al rubro
  marca: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Oftalmologo' })
  oftalmologo: Types.ObjectId;

  @Prop()
  comisiona: Boolean

  @Prop()
  producto: string;

  @Prop()
  cantidad: number;

  @Prop()
  importe: number;

  @Prop()
  montoTotal: number;

  @Prop({ type: Types.ObjectId, ref: 'Tipo_venta' })
  tipoVenta: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'Material' })
  material: Types.ObjectId;

  @Prop({ type: String, enum: flagVenta, default: flagVenta.nuevo })
  flag: flagVenta;



  @Prop({ type: Date })
  fecha: Date;

  @Prop()
  flagVenta: string;

  @Prop({ type: Date, default: Date.now() })
  fechaCreacion: Date;
}
export const VentaSchema = SchemaFactory.createForClass(Venta);
VentaSchema.index({ sucursal: 1 });
VentaSchema.index({ empresa: 1 });
VentaSchema.index({ asesor: 1 });




