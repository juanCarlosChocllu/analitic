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

  @Prop({ type: Types.ObjectId, ref: 'ColorLente' })
  colorLente: Types.ObjectId;

  
  @Prop({ type: Types.ObjectId, ref: 'Rango' })
  rango: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MarcaLente' }) //se aplica depente al rubro
  marcaLente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Marca' })//se aplica depente al rubro
  marca: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Medico' })
  medico: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Receta' })
  receta: Types.ObjectId;

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

  @Prop({ type: String})
  estadoTracking:string

  @Prop({ type: String})
  numeroCotizacion:string

  @Prop({ type: Number})
  descuentoFicha:number

  @Prop({ type: String})
  tipoConversion:string

  @Prop({type:String})
  descripcion:string

  @Prop({ type: Boolean})
  cotizacion:boolean

  @Prop({ type: Date })
  fecha: Date;///fecha finalizada

  @Prop({ type: Date })
  fechaVenta: Date;///fecha realizada

  @Prop()
  flagVenta: string;

  @Prop()
  estado: string;
  
  @Prop({ type: Date })
  fechaAnulacion: Date;

@Prop({ type: Date, default: () => Date.now() })
  fechaCreacion: Date;
}
export const VentaSchema = SchemaFactory.createForClass(Venta);
VentaSchema.index({ numeroTicket: 1 });
VentaSchema.index({ numeroTicket: 1, estadoTracking:1});
VentaSchema.index({ sucursal: 1 });
VentaSchema.index({ empresa: 1 });
VentaSchema.index({ asesor: 1 });

//-------------------------------------/
VentaSchema.index({estadoTracking:1, numeroCotizacion:1,producto:1, cotizacion:1})
VentaSchema.index({numeroTicket:1, producto:1 })
