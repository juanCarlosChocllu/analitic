import { Types } from "mongoose";

import { FiltroVentaI } from "../interfaces/filtro.venta.interface";
import { VentaTodasDto } from "../dto/venta.todas.dto";
import { VentaDto } from "src/venta/core/dto/venta.dto";

export function filtradorVenta(kpiDto:VentaDto | VentaTodasDto){
    let filtrador:FiltroVentaI={
        fecha: {
          $gte: new Date(kpiDto.fechaInicio),
          $lte: new Date(kpiDto.fechaFin),
          
        },
      
      }
      if(kpiDto.comisiona != null){
        filtrador.comisiona = kpiDto.comisiona
      }
      kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: kpiDto.tipoVenta.map((id)=>new Types.ObjectId( id))} : filtrador
      return filtrador
}