import { Expose } from "class-transformer";

export enum EstadoEnum {
  realizadas = 'REALIZADAS',
  finalizadas = 'FINALIZADO',
  abonadas = 'ABONADAS',
}

export enum EstadoVentaE{
  ACTUAL='ACTUAL',
  ANTERIOR='ANTERIOR'
}