import { Types } from 'mongoose';
import { FiltroVentaI } from '../interfaces/filtro.venta.interface';
import { InformacionVentaDto } from '../dto/informacion.venta.dto';
import { FlagVentaE } from '../enums/estado.enum';

export function filtradorKpiInformacion(
  sucursal: string,
  informacionVentaDto: InformacionVentaDto,
): FiltroVentaI {
  const filtrador: FiltroVentaI = {
    sucursal: new Types.ObjectId(sucursal),
      estadoTracking:{$ne:'ANULADO'}
  };

  if (informacionVentaDto.flagVenta === FlagVentaE.finalizadas) {
    filtrador.fecha = {
      $gte: new Date(
        new Date(informacionVentaDto.fechaInicio).setUTCHours(0, 0, 0, 0),
      ),
      $lte: new Date(
        new Date(informacionVentaDto.fechaFin).setUTCHours(23, 59, 59, 999),
      ),
    };
  }

  if (informacionVentaDto.flagVenta === FlagVentaE.realizadas) {
    filtrador.fechaVenta = {
      $gte: new Date(
        new Date(informacionVentaDto.fechaInicio).setUTCHours(0, 0, 0, 0),
      ),
      $lte: new Date(
        new Date(informacionVentaDto.fechaFin).setUTCHours(23, 59, 59, 999),
      ),
    };
  }

  if (informacionVentaDto.comisiona != null) {
    filtrador.comisiona = informacionVentaDto.comisiona;
  }

  informacionVentaDto.tipoVenta.length > 0
    ? (filtrador.tipoVenta = {
        $in: informacionVentaDto.tipoVenta.map((id) => new Types.ObjectId(id)),
      })
    : filtrador;

    
  return filtrador;
}
