import { Prop, SchemaFactory,Schema } from "@nestjs/mongoose";


@Schema()
export class EmpresaExcel {
  @Prop()
  nombre: string;
}

export const EmpresaExcelSchema = SchemaFactory.createForClass(EmpresaExcel);