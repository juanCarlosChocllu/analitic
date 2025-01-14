import { Types } from "mongoose"
import { VentaMedicosDto } from "../dto/venta.medicos.dto"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"

export function filtradorMedicos(kpiDto:VentaMedicosDto){
    let filtrador:FiltroVentaI={
        fecha: {
          $gte: new Date(kpiDto.fechaInicio),
          $lte: new Date(kpiDto.FechaFin),
          
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