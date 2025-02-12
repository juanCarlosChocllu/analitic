import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Flag } from "src/core/enums/flag"

@Schema({collection:'NombreDia'})
export class NombreDia {
    @Prop()
    nombre:string
    @Prop()
    tipo:string

    @Prop({type:String, enum:Flag , default:Flag.nuevo })
    flag:Flag
    @Prop({type:Date, default:Date.now()})
    fecha:Date
}
export const nombreDiaSchema = SchemaFactory.createForClass(NombreDia)

