import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'Empresa' })
export class Empresa {
  @Prop()
  nombre: String;
}

export const EmpresaSchama = SchemaFactory.createForClass(Empresa);
