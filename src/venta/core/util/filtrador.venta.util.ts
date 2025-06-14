import { Types } from "mongoose";

import { FiltroVentaI } from "../interfaces/filtro.venta.interface";
import { VentaTodasDto } from "../dto/venta.todas.dto";
import { VentaDto } from "src/venta/core/dto/venta.dto";
import { EstadoEnum } from "../enums/estado.enum";
import { Log } from "src/log/schemas/log.schema";

export function filtradorVenta(filtro:VentaDto | VentaTodasDto){
    let filtrador:FiltroVentaI={
      }
      if(filtro.flagVenta === EstadoEnum.finalizadas){
          filtrador.flagVenta = {$eq: EstadoEnum.finalizadas }
        filtrador.fecha = {
          $gte: new Date(new Date(filtro.fechaInicio).setUTCHours(0,0,0,0)),
          $lte: new Date(new Date(filtro.fechaFin).setUTCHours(23,59,59,999)),
        }
      }

       if(filtro.flagVenta === EstadoEnum.realizadas){
          filtrador.flagVenta = {$ne: EstadoEnum.finalizadas }
        filtrador.fechaVenta = {
          $gte: new Date(new Date(filtro.fechaInicio).setUTCHours(0,0,0,0)),
          $lte: new Date(new Date(filtro.fechaFin).setUTCHours(23,59,59,999)),
        }
      }


      if(filtro.comisiona != null){
        filtro.comisiona = filtro.comisiona
      }
      filtro.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: filtro.tipoVenta.map((id)=>new Types.ObjectId( id))} : filtrador

      
      return filtrador
}