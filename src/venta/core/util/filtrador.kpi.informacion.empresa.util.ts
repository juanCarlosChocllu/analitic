import { Types } from "mongoose"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"
import { InformacionVentaDto } from "../dto/informacion.venta.dto"

export function filtradorKpiInformacionEmpresa(empresa:string,informacionVentaDto :InformacionVentaDto):FiltroVentaI{
    const filtrador:FiltroVentaI ={
        fecha:{
          $gte: new Date(new Date(informacionVentaDto.fechaInicio).setUTCHours(0,0,0,0)),
          $lte: new Date(new Date(informacionVentaDto.fechaFin).setUTCHours(23,59,59,999)),
        },
        empresa:new Types.ObjectId(empresa)
      }
      if(informacionVentaDto.comisiona != null){
        filtrador.comisiona = informacionVentaDto.comisiona
      }
  
      
      informacionVentaDto.tipoVenta.length > 0 ? filtrador.tipoVenta= {$in: informacionVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
    return filtrador
}