import { Types } from "mongoose";
import { KpiDto } from "../dto/kpi.venta.dto";
import { FiltroVentaI } from "../interfaces/filtro.venta.interface";
import { KpiEmpresaDto } from "../dto/kpi.venta.empresas.dto";

export function filtradorKpi(kpiDto:KpiDto | KpiEmpresaDto){
    let filtrador:FiltroVentaI={
        fecha: {
          $gte: new Date(kpiDto.fechaInicio),
          $lte: new Date(kpiDto.FechaFin),
          
        },
      
      }
      if(kpiDto.comisiona != null){
        filtrador.comisiona = kpiDto.comisiona
      }
      kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: kpiDto.tipoVenta.map((id)=>new Types.ObjectId( id))} : filtrador
      return filtrador
}