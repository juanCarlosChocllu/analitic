import { Types } from "mongoose"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"
import { FlagVentaE } from "../enums/estado.enum"
import { DetalleVentaFilter } from "../dto/informacion.empresas.todas.dto"

export function filtradorKpiInformacionTodasEmpresas(informacionEmpresasTodasVentaDto :DetalleVentaFilter):FiltroVentaI{
   
      
  const filtrador:FiltroVentaI ={
        
        empresa: {$in: informacionEmpresasTodasVentaDto.empresa.map((id)=> new Types.ObjectId(id))},
           estadoTracking:{$ne:'ANULADO'}
      
      }

      if(informacionEmpresasTodasVentaDto.flagVenta === FlagVentaE.finalizadas) {
        filtrador.fecha={
          $gte: new Date(new Date(informacionEmpresasTodasVentaDto.fechaInicio).setUTCHours(0,0,0,0)),
          $lte: new Date(new Date(informacionEmpresasTodasVentaDto.fechaFin).setUTCHours(23,59,59,999)),
        }
      }

        if(informacionEmpresasTodasVentaDto.flagVenta === FlagVentaE.realizadas) {
        
        filtrador.fechaVenta={
          $gte: new Date(new Date(informacionEmpresasTodasVentaDto.fechaInicio).setUTCHours(0,0,0,0)),
          $lte: new Date(new Date(informacionEmpresasTodasVentaDto.fechaFin).setUTCHours(23,59,59,999)),
        }
      }

      if(informacionEmpresasTodasVentaDto.comisiona != null){
        filtrador.comisiona = informacionEmpresasTodasVentaDto.comisiona
      }
  
      
      informacionEmpresasTodasVentaDto.tipoVenta.length > 0 ? filtrador.tipoVenta= {$in: informacionEmpresasTodasVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
  
        return filtrador
}