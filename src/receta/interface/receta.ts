import { Types } from 'mongoose';

export interface RecetaResponseI {
  codigoMia: string;
  medico: string;
  codigoReceta: string;
  especialidad: string;
  esfericoLejosD: string;
  esfericoLejosI: string;
  esfericoCercaD: string;
  esfericoCercaI: string;

  cilindricoLejosD: string;
  cilindricoLejosI: string;
  cilindricoCercaD: string;
  cilindricoCercaI: string;

  ejeLejosD: string;
  ejeLejosI: string;
  ejeCercaD: string;
  ejeCercaI: string;

  altura: string;

  distanciaLejosD: string;
  distanciaLejosI: string;
  distanciaCercaD: string;
  distanciaCercaI: string;

  dpLejos: string;
  dpCerca: string;

  addLejos: string;
  addCerca: string;

  fecha: string;

  observacion: string;
  tipo: string;
  tipoLenteTexto: string;
  tipoCreacion: string;

  recomenacionLentePrincipal: string;
  recomenacionLenteComplementario: string;
  recomendacionProteccionDeSol: string;
  recomendacionLenteDeContacto: string;

  lcEsferaOd: string;
  lcCilindroOd: string;
  lcEjeOd: string;
  lcCurvaBaseOd: string;
  lcDiametroOd: string;

  lcEsferaOi: string;
  lcCilindroOi: string;
  lcEjeOi: string;
  lcCurvaBaseOi: string;
  lcDiametroOi: string;
}

export interface RecetaI {
  _id?: Types.ObjectId;
  codigoMia: string;
  medico: Types.ObjectId;

  esfericoLejosD: string;
  esfericoLejosI: string;
  esfericoCercaD: string;
  esfericoCercaI: string;

  cilindricoLejosD: string;
  cilindricoLejosI: string;
  cilindricoCercaD: string;
  cilindricoCercaI: string;

  ejeLejosD: string;
  ejeLejosI: string;
  ejeCercaD: string;
  ejeCercaI: string;

  altura: string;

  distanciaLejosD: string;
  distanciaLejosI: string;
  distanciaCercaD: string;
  distanciaCercaI: string;

  dpLejos: string;
  dpCerca: string;

  addLejos: string;
  addCerca: string;

  fecha: Date;

  observacion: string;
  tipo: string;
  tipoLenteTexto: string;
  tipoCreacion: string;

  recomenacionLentePrincipal: string;
  recomenacionLenteComplementario: string;
  recomendacionProteccionDeSol: string;
  recomendacionLenteDeContacto: string;

  lcEsferaOd: string;
  lcCilindroOd: string;
  lcEjeOd: string;
  lcCurvaBaseOd: string;
  lcDiametroOd: string;

  lcEsferaOi: string;
  lcCilindroOi: string;
  lcEjeOi: string;
  lcCurvaBaseOi: string;
  lcDiametroOi: string;
}

export interface RecetaMedicoI {
  data:dataRecetaI[];
  nombre: string;
  especialidad: string;
  recetas: number;
  idMedico:string
}

interface dataRecetaI {
    fecha:string,
    codigo:string
}