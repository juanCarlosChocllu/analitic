import { Types } from 'mongoose';

export interface AsesorExcelI {
  id: Types.ObjectId;

  usuario: string;

  sucursal: Types.ObjectId;
}
