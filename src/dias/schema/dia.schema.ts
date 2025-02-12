import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Flag } from "src/core/enums/flag"
import { DiaEstadoE } from "../enums/diaEstado"

@Schema({collection:'Dia'})
export class Dia {
    @Prop()
    dia:Date
    @Prop({type:Types.ObjectId, ref:'Sucursal'})
    sucursal:Types.ObjectId

    @Prop({type:Types.ObjectId, ref:'NombreDia'})
    nombreDia:Types.ObjectId
    @Prop({type:String, enum:DiaEstadoE , default:DiaEstadoE.habil})
    
    estado:string
    @Prop({type:String, enum:Flag , default:Flag.nuevo })
    flag:Flag
    @Prop({type:Date, default:Date.now()})
    fecha:Date

}
export const diaSchema = SchemaFactory.createForClass(Dia)

