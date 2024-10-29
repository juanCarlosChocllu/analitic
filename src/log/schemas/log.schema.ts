import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({collection:'Log'})
export class Log {
        @Prop({type:Types.ObjectId , ref:'usuarios'})
        usuario:Types.ObjectId

        @Prop()
        descripcion:string

        
        @Prop()
        schema:string

        
        @Prop({type:Date , default:Date.now})
        fecha:Date

}
export const logSchema= SchemaFactory.createForClass(Log)