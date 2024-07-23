import { VentaPorProductoI, VentaTotalI } from "./venta.interface";

export interface respuestaI {
    cantidadVenta:number,
    dineroTotal:number,
    cantidadScursal:number
    tkPromedio:number,
    gafas:any
    lc:any
    monturas:any
    porSucursal:VentaTotalI[],
  }


  export interface RespuestaData {
    data1: {
      fecha: {
        inicio: string;
        fin: string;
      };
      total: number; 
      gafas: any; 
      monturas: any; 
      lc: any;
    };
    data2: {
      fecha: {
        inicio: string;
        fin: string;
      };
      total2: number; 
      gafas1: any; 
      monturas1: any;
      lc1: any; 
    };
  }