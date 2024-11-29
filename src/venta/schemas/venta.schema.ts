import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { flagVenta } from '../enums/flgaVenta.enum';

@Schema()
export class VentaExcel {
  @Prop()
  aperturaTicket: string;
  @Prop()
  numeroTicket: string;

  @Prop({ type: Types.ObjectId, ref: 'SuscursalExcel' })
  sucursal: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmpresaExcel' })
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
export const VentaExcelSchema = SchemaFactory.createForClass(VentaExcel);
VentaExcelSchema.index({ sucursal: 1 });
VentaExcelSchema.index({ empresa: 1 });
VentaExcelSchema.index({ asesor: 1 });




