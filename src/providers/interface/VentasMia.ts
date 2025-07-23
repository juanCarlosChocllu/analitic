export interface AnularVentaMiaI{
    id_venta:string
    estado:string,
    estadoTracking:string
    fechaAprobacionAnulacion:string
}

export interface FinalizarVentaMia{
    id_venta:string
    estado:string,
    estadoTracking:string
    flaVenta:string
    fecha_finalizacion:string
}