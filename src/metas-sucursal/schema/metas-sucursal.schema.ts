import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Flag } from "src/core/enums/flag"
@Schema({collection:'MetasSucursal'})
export class MetasSucursal {
         @Prop({type:Number, default:0})
     
         monto:number

         @Prop({type:Number, default:0})
     
         ticket:number

         @Prop({type:Number, default:0})
         dias:number
         
         @Prop({type:Types.ObjectId, ref :'Sucursal'})

         sucursal:Types.ObjectId
         @Prop()
     
         fechaInicio:Date
         @Prop()
     
         fechaFin:Date
     
         @Prop({type:String,default:Flag.nuevo})
         flag:Flag.nuevo
         
         @Prop({default:()=> Date.now()})
         fecha:Date
     }

export const metasSucursalSchema = SchemaFactory.createForClass(MetasSucursal)



