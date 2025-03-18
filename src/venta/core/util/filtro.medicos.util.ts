import { Types } from "mongoose"

import { FiltroVentaI } from "../interfaces/filtro.venta.interface"
import { VentaMedicosDto } from "src/venta/medicos/dto/venta.medicos.dto"

export function filtradorMedicos(kpiDto:VentaMedicosDto){
    let filtrador:FiltroVentaI={
        fecha: {
          $gte: new Date(new Date(kpiDto.fechaInicio).setUTCHours(0,0,0,0)),
          $lte: new Date(new Date(kpiDto.fechaFin).setUTCHours(23,59,59,999)),
          
        },
      
      }
      if(kpiDto.comisiona != null){
        filtrador.comisiona = kpiDto.comisiona
      }
      if(kpiDto.especialidad != null){
        filtrador.especialidad = kpiDto.especialidad
      }
      kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: kpiDto.tipoVenta.map((id)=>new Types.ObjectId( id))} : filtrador
      return filtrador
}