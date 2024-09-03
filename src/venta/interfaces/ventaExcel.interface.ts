import { Types } from "mongoose"

export interface VentaExcelI {

    sucursal:string
    
    aperturaTicket :string

    numeroTicket:string

    producto:string

    asesor:string

    cantidad:number
    
    importe:number

    montoTotal:number

    acompanantes:number

    tipoVenta:string
    
    fecha:string

    flagVenta :string 
}