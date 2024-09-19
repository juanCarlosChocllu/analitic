import { Types } from "mongoose";

export interface abonoI {
  fecha: string;
  numeroTicket: string;
  monto: number;
  venta?:Types.ObjectId
  flag: string;
}
