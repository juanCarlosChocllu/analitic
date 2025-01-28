
import { flagVenta } from "src/venta/core/enums/flgaVenta.enum";

export interface ventaInformacionRI {
    id_venta: string,
    comisiona: boolean,
    oftalmologo: string,
    especialidad: string,
    sucursal: string,
    flag: flagVenta,
    fecha_finalizacion: string

}