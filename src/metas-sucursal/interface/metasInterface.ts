import { Types } from "mongoose";

export interface MestasSucursalI{
    monto:number,
    ticket:number,
    sucursal:Types.ObjectId,
    nombreSucursal:string
}