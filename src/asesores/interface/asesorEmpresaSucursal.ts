import { Types } from "mongoose";

export interface AsesorEmpresaSucursalI{
    sucursal:Types.ObjectId
    nombreSucursal:string
    asesor:Types.ObjectId,
    nombreAsesor:string
    nombreEmpresa:string
}