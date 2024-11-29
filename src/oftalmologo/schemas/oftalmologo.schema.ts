import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({collection:'Oftalmologo'})
export class Oftalmologo {

    @Prop()
    nombreCompleto:string

    @Prop()
    especialidad:string

    
    @Prop({ type: Types.ObjectId, ref: 'SuscursalExcel' })
    sucursal: Types.ObjectId;

    @Prop({type:Date, default:Date.now})
    fecha:Date

}
export const oftalmologoSchema = SchemaFactory.createForClass(Oftalmologo)
