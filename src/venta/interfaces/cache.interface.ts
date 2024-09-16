export interface CacheData {
  data: {
    fecha: { inicio: string; fin: string };
    ventaTotal: any;
    dataVenta: any;
  };
  dataSucursal: {
    fecha: { inicio: string; fin: string };
    ventaPorSucursal: any;
    cantidadSucursales: number;
    dataPorSucursal: any;
  };
}
