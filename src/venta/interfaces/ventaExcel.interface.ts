import { Types } from 'mongoose';

export interface VentaExcelI {
  sucursal: string;

  aperturaTicket: string;

  numeroTicket: string;

  producto: string;

  asesor: string;

  cantidad: number;

  importe: number;

  montoTotal: number;

  atributo6: string;

  atributo2: string;
  
  atributo1: string;

  tipoVenta: string;
  
  atributo3:string

  atributo5:string

  atributo4:string
  
  fecha: string;

  flagVenta: string;
}
