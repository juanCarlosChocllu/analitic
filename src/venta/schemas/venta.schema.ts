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
    aperturaTicket:string
    @Prop()
    numeroTicket:string

    @Prop({type:Types.ObjectId , ref:'SuscursalExcel'})
    sucursal:Types.ObjectId

    @Prop({type:Types.ObjectId , ref:'EmpresaExcel'})
    empresa:Types.ObjectId
    
    @Prop({type:Types.ObjectId , ref:'AsesorExcel'})
    asesor:Types.ObjectId

    @Prop()
    producto:string

    @Prop()
    cantidad:number

    @Prop()
    importe: number 

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
    @Prop({type:Types.ObjectId, ref:'EmpresaExcel'})
    empresa:Types.ObjectId
}

export const SuscursalExcelSchema=SchemaFactory.createForClass(SuscursalExcel)


@Schema()
export class EmpresaExcel{
    @Prop()
    nombre:string
}

export const EmpresaExcelSchema=SchemaFactory.createForClass(EmpresaExcel)

@Schema()
export class AsesorExcel{
    @Prop()
    usuario:string

    @Prop({type:Types.ObjectId , ref:'SuscursalExcel'})
    sucursal:Types.ObjectId

}

export const AsesorExcelSchema=SchemaFactory.createForClass(AsesorExcel)