import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ collection: 'Venta' })
export class Venta {
    @Prop()
    tipoVenta:Types.ObjectId
    
    @Prop()
    precioTotal:number
}
export const VentaSchema= SchemaFactory.createForClass(Venta)

