import { Types } from "mongoose"
import { InformacionVentaDto } from "../dto/informacion.venta.dto"
import { FiltroVentaI } from "../interfaces/filtro.venta.interface"
import { FlagVentaE } from "../enums/estado.enum"

export function filtroInformacionAsesor(asesor:string,informacionVentaDto :InformacionVentaDto):FiltroVentaI{
    const filtrador:FiltroVentaI ={
       
        asesor:new Types.ObjectId(asesor)
      }

      if(informacionVentaDto.flagVenta === FlagVentaE.realizadas) {
         filtrador.fechaVenta= {
          $gte: new Date(new Date(informacionVentaDto.fechaInicio).setUTCHours(0,0,0,0)),
        $lte: new Date(new Date(informacionVentaDto.fechaFin).setUTCHours(23,59,59,999)),
        }
      }

      if(informacionVentaDto.flagVenta === FlagVentaE.finalizadas) {
         filtrador.fecha= {
          $gte: new Date(new Date(informacionVentaDto.fechaInicio).setUTCHours(0,0,0,0)),
        $lte: new Date(new Date(informacionVentaDto.fechaFin).setUTCHours(23,59,59,999)),
        }
      }


      if(informacionVentaDto.comisiona != null){
        filtrador.comisiona = informacionVentaDto.comisiona
      }
  
      
      informacionVentaDto.tipoVenta.length > 0 ? filtrador.tipoVenta= {$in: informacionVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
    return filtrador
}