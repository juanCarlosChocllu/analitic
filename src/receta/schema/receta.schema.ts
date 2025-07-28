import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { flagVenta } from 'src/venta/core/enums/flgaVenta.enum';

@Schema({ collection: 'Receta' })
export class Receta {
  @Prop()
  codigoMia: string;
  @Prop({type:Types.ObjectId, ref:'Medico'})
  medico: Types.ObjectId;
  @Prop()
  codigoReceta: string;
  @Prop()
  esfericoLejosD: string;
  @Prop()
  esfericoLejosI: string;
  @Prop()
  esfericoCercaD: string;
  @Prop()
  esfericoCercaI: string;
  @Prop()
  cilindricoLejosD: string;
  @Prop()
  cilindricoLejosI: string;
  @Prop()
  cilindricoCercaD: string;
  @Prop()
  cilindricoCercaI: string;
  @Prop()
  ejeLejosD: string;
  @Prop()
  ejeLejosI: string;
  @Prop()
  ejeCercaD: string;
  @Prop()
  ejeCercaI: string;
  @Prop()
  altura: string;
  @Prop()
  distanciaLejosD: string;
  @Prop()
  distanciaLejosI: string;
  @Prop()
  distanciaCercaD: string;
  @Prop()
  distanciaCercaI: string;

  @Prop()
  dpLejos: string;
  @Prop()
  dpCerca: string;
  @Prop()
  addLejos: string;
  @Prop()
  addCerca: string;
  @Prop()
  fecha: Date;
  @Prop()
  observacion: string;
  @Prop()
  tipo: string;
  @Prop()
  tipoLenteTexto: string;
  @Prop()
  tipoCreacion: string;
  @Prop()
  recomenacionLentePrincipal: string;
  @Prop()
  recomenacionLenteComplementario: string;
  @Prop()
  recomendacionProteccionDeSol: string;
  @Prop()
  recomendacionLenteDeContacto: string;
  @Prop()
  lcEsferaOd: string;
  @Prop()
  lcCilindroOd: string;
  @Prop()
  lcEjeOd: string;
  @Prop()
  lcCurvaBaseOd: string;
  @Prop()
  lcDiametroOd: string;
  @Prop()
  lcEsferaOi: string;
  @Prop()
  lcCilindroOi: string;
  @Prop()
  lcEjeOi: string;
  @Prop()
  lcCurvaBaseOi: string;
  @Prop()
  lcDiametroOi: string;

  @Prop({ type: String, enum: flagVenta, default: flagVenta.nuevo })
flag: flagVenta;
    
@Prop({ type: Date, default: () => Date.now() })
  fechaCreacion: Date;
}
export const recetaSchema = SchemaFactory.createForClass(Receta)
recetaSchema.index({codigoMia:1})