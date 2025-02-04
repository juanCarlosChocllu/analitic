import { Types } from "mongoose";

interface  DataMedicoI {

    nombre: string,
    cantidad: number,
    medico: number,
  
    importe: number,
    e: string, //especialidad
}

export interface VentaMedicoI {
    sucursal: string,
    totalRecetas: number,
    
    importe: number,
    idScursal: Types.ObjectId,
    data: DataMedicoI[],
}