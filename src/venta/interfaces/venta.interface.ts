import { ObjectId } from 'mongodb';

export interface VentaTotalI {
  _id?: ObjectId;
  sucursal: string;
  total: number;
  totalVentas:number
  ticketPromedio:number

}
export interface VentaPorProductoI {
  _id: string;
  producto: {
      nombre: string[];        // Puede ser un array si hay múltiples nombres, de lo contrario, usar solo string
      venta: string[];         // Puede ser un array si hay múltiples ventas relacionadas
      sucursal: string[];      // Puede ser un array si hay múltiples sucursales relacionadas
      preciototal: number;
      cantidad: number;
  };
}