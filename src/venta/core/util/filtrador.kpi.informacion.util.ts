import { Types } from "mongoose"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"
import { InformacionVentaDto } from "../dto/informacion.venta.dto"

export function filtradorKpiInformacion(sucursal:string,informacionVentaDto :InformacionVentaDto):FiltroVentaI{
    const filtrador:FiltroVentaI ={
        fecha:{
          $gte:new Date(informacionVentaDto.fechaInicio),
          $lte:new Date(informacionVentaDto.fechaFin)
        },
        sucursal:new Types.ObjectId(sucursal)
      }
      if(informacionVentaDto.comisiona != null){
        filtrador.comisiona = informacionVentaDto.comisiona
      }
  
      
      informacionVentaDto.tipoVenta.length > 0 ? filtrador.tipoVenta= {$in: informacionVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
    return filtrador
}