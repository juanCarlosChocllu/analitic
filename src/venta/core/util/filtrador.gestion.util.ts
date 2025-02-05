import { Types } from "mongoose"
import { VentaDto } from "../dto/venta.dto"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"

export function filtradorDeGestion( ventaDto: VentaDto){
    const filtrador: FiltroVentaI={
        fecha:{
          $gte: new Date(ventaDto.fechaInicio),
          $lte: new Date(ventaDto.FechaFin),
        }
      }
      if(ventaDto.comisiona != null){
        filtrador.comisiona = ventaDto.comisiona
      }
  
      ventaDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in:ventaDto.tipoVenta.map((id)=>new Types.ObjectId(id))}:filtrador
   
      return filtrador
}

