import { Types } from 'mongoose';

export interface FiltroVentaI {
  fecha?: {
    $gte: Date;
    $lte: Date;
  };
  fechaVenta?: {
    $gte: Date;
    $lte: Date;
  };
  empresa?: Types.ObjectId|{$in :Types.ObjectId[] };
  sucursal?: Types.ObjectId;
  asesor?: Types.ObjectId;
  tipoVenta?: Types.ObjectId | {$in :Types.ObjectId[] } ;
  flagVenta?: string | { $ne: string } | {$eq :string };
  comisiona?:boolean | null
  especialidad?:string | null
  estadoTracking: { $ne: string }
 
}



