import { Types } from "mongoose"
import { VentaDto } from "../dto/venta.dto"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"

export function filtradorDeGestion( ventaDto: VentaDto){
    const filtrador: FiltroVentaI={
        fecha:{
          $gte: new Date(new Date(ventaDto.fechaInicio).setUTCHours(0,0,0,0)),
        $lte: new Date(new Date(ventaDto.fechaFin).setUTCHours(23,59,59,999)),
        }
      }
      if(ventaDto.comisiona != null){
        filtrador.comisiona = ventaDto.comisiona
      }
  
      ventaDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in:ventaDto.tipoVenta.map((id)=>new Types.ObjectId(id))}:filtrador
   
      return filtrador
}

