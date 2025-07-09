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
    ventaLenteLc:number
    
    importe: number,
    idScursal: Types.ObjectId,
    data: DataMedicoI[],
}

export interface resultadoRecetaI {
          idVenta:string,
            flagVenta: string,
            cantidad:number
            fechaVenta:Date | string
            fechaReceta:string
            codigoReceta:string
}
