import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

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
