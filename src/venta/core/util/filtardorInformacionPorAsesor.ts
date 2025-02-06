import { Types } from "mongoose"
import { InformacionVentaDto } from "../dto/informacion.venta.dto"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"

export function filtroInformacionAsesor(asesor:string,informacionVentaDto :InformacionVentaDto):FiltroVentaI{
    const filtrador:FiltroVentaI ={
        fecha:{
          $gte:new Date(informacionVentaDto.fechaInicio),
          $lte:new Date(informacionVentaDto.fechaFin)
        },
        asesor:new Types.ObjectId(asesor)
      }
      if(informacionVentaDto.comisiona != null){
        filtrador.comisiona = informacionVentaDto.comisiona
      }
  
      
      informacionVentaDto.tipoVenta.length > 0 ? filtrador.tipoVenta= {$in: informacionVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
    return filtrador
}