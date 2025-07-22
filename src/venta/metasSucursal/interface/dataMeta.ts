import { Types } from "mongoose";

export interface DataMetaI {
  _id:Types.ObjectId
  sucursal: string;
  montoMeta: number;
  ticketMeta: number;
  ticketVenta: number;
  importVenta: number;
  cumplimientoTicket: number;
  cumplimientoImporte: number;
  indeceAvance:number,
  diasHAbiles:number
}
