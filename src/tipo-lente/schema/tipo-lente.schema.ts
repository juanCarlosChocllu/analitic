import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({collection:'TipoLente'})
export class TipoLente {
  @Prop()
  nombre: string;
}
export const TipoLenteSchema = SchemaFactory.createForClass(TipoLente);
