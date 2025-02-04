import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import {  Types } from "mongoose"
import { Flag } from "src/core/enums/flag"

@Schema({collection:'DiasMetasSucursal'})
export class DiasMetasSucursal {
   

    @Prop({type:Types.ObjectId, ref :'Sucursal'})
    metasSucursal:Types.ObjectId
    
    @Prop()
    metaDia:Date  

    @Prop({type:String,default:Flag.nuevo})
    flag:Flag.nuevo
    
    @Prop({default:Date.now()})
    fecha:Date
}

export const diasMetasSucursalSchema = SchemaFactory.createForClass(DiasMetasSucursal)

