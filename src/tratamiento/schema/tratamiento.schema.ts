import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({collection:'Tratamiento'})
export class Tratamiento {
  @Prop()
  nombre: string;
}
export const TratamientoSchema = SchemaFactory.createForClass(Tratamiento);
