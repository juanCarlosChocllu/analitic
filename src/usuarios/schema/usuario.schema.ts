import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Flag } from "src/common/enums/flag";
import { flag } from "src/venta/enums/flag.enum";


@Schema()
export class Usuario {

    @Prop()
    nombre:string

    @Prop()
    apellidos:string

    @Prop()
    username:string
    
    @Prop({select:false})
    password:string

    @Prop()
    rol:string

    //@Prop()
   // permisos:string[]

    @Prop({type:String, enum:Flag, default:Flag.nuevo})
    flag:string

}

export const usuariosSchema = SchemaFactory.createForClass(Usuario)



