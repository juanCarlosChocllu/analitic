import { Prop, SchemaFactory,Schema } from "@nestjs/mongoose";


@Schema({collection:'Empresa'})
export class Empresa {
  @Prop()
  nombre: string;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);