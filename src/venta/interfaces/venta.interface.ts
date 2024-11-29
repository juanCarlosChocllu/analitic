import exp from 'constants';
import { ObjectId } from 'mongodb';

export interface VentaTotalI {
  _id?: ObjectId;
  sucursal: string;
  total: number;
  totalVentas: number;
  ticketPromedio: number;
}
export interface VentaPorProductoI {
  _id: string;
  producto: {
    nombre: string[]; 
    venta: string[]; 
    sucursal: string[]; 
    preciototal: number;
    cantidad: number;
  };
}

export interface ProductoVentaI {
  producto: string;
  cantidad: number;
  total: number;
}

export interface VentaI {
  montura: ProductoVentaI;
  lenteDeContacto: ProductoVentaI;
  lente: ProductoVentaI;
  gafa: ProductoVentaI;
  otroProducto: ProductoVentaI;
}
