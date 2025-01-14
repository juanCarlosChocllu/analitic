import { Types } from "mongoose"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"
import { InformacionEmpresasTodasVentaDto } from "../dto/informacion.empresas.todas.dto"

export function filtradorKpiInformacionTodasEmpresas(informacionEmpresasTodasVentaDto :InformacionEmpresasTodasVentaDto):FiltroVentaI{
    const filtrador:FiltroVentaI ={
        fecha:{
          $gte:new Date(informacionEmpresasTodasVentaDto.fechaInicio),
          $lte:new Date(informacionEmpresasTodasVentaDto.fechaFin)
        },
        empresa: {$in: informacionEmpresasTodasVentaDto.empresa.map((id)=> new Types.ObjectId(id))}
      }
      if(informacionEmpresasTodasVentaDto.comisiona != null){
        filtrador.comisiona = informacionEmpresasTodasVentaDto.comisiona
      }
  
      
      informacionEmpresasTodasVentaDto.tipoVenta.length > 0 ? filtrador.tipoVenta= {$in: informacionEmpresasTodasVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
    return filtrador
}