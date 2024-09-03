import { Types } from "mongoose";

export interface FiltroVentaI {
    fecha: {
      $gte: Date;
      $lte: Date;
    };
    tipoVenta?: Types.ObjectId;
    flagVenta?:string |  { $ne: string }
  }