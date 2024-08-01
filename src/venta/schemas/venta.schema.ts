import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { flag } from "../enums/flag.enum";
import { flagVenta } from "../enums/flgaVenta.enum";

@Schema({ collection: 'Venta' })
export class Venta {
    @Prop()
    tipoVenta:Types.ObjectId
    
    @Prop()
    precioTotal:number
}
export const VentaSchema= SchemaFactory.createForClass(Venta)

@Schema({collection:'DetalleVenta'})
export class DetalleVenta{

}

export const DetalleVentaSchema=SchemaFactory.createForClass(DetalleVenta)


@Schema()
export class VentaExcel {
    @Prop()
    numeroTicket:string

    @Prop()
    sucursal:string

    @Prop()
    producto:string

    @Prop()
    cantidad:number

    @Prop()
    montoTotal:number
    
    @Prop({type:String, enum :flagVenta, default:flagVenta.nuevo})
    flag:flagVenta

    @Prop({type:Date})
    fecha:Date

    @Prop({type:Date, default:Date.now()})
    fechaCreacion:Date  
}
export const VentaExcelSchema= SchemaFactory.createForClass(VentaExcel)

@Schema()
export class SuscursalExcel{
    @Prop()
    nombre:string
}

export const SuscursalExcelSchema=SchemaFactory.createForClass(SuscursalExcel)