import { Types } from "mongoose";

export interface MestasSucursalI{
    monto:number,
    ticket:number,
    sucursal:Types.ObjectId,
    nombreSucursal:string
}

export  interface webhookMentasI {
        monto: number;  
        ticket: number;
        
        sucursal: string [];
    
        dias: number;
      
        fechaInicio: string;
      
 
        fechaFin: string;
        codigo:string
}