import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'Receta' })
export class Receta {
  @Prop()
  codigoMiaReceta: string;
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
  tipo: string;

  @Prop()
  tipoLenteTexto: string;

  @Prop()
  medico: Types.ObjectId;

  @Prop()
  tipoCreacion: string;
  @Prop()
  flag: string;

  @Prop()
  recomenacionLentePrincipal: string;
  @Prop()

  recomenacionLenteComplementario: string;
  @Prop()

  recomendacionProteccionDeSol: string;
  @Prop()
  
  recomendacionLenteDeContacto: string;
}
