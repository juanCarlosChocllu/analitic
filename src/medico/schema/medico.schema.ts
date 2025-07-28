import { Prop , Schema, SchemaFactory} from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({collection:'Medico'})
export class Medico {
       @Prop()
        nombreCompleto:string
    
        @Prop()
        especialidad:string
    
    
        @Prop({type:Date, default:Date.now})
        fecha:Date
    
}

export const medicoShema = SchemaFactory.createForClass(Medico)
medicoShema.index({nombreCompleto:1, especialidad:1})

