import { Types } from 'mongoose';

export interface FiltroVentaI {
  fecha: {
    $gte: Date;
    $lte: Date;
  };
  empresa?: Types.ObjectId;
  sucursal?: Types.ObjectId;
  tipoVenta?: Types.ObjectId;
  flagVenta?: string | { $ne: string };
}
