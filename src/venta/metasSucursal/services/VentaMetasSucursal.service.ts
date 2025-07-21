import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flag } from 'src/core/enums/flag';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { MetasSucursalService } from 'src/metas-sucursal/services/metas-sucursal.service';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { calcularPorcentaje } from 'src/venta/core/util/calcularPorcentaje';

import { Venta } from 'src/venta/schemas/venta.schema';
import { DataMetaI } from '../interface/dataMeta';
import { filtradorVenta } from 'src/venta/core/util/filtrador.venta.util';
import { CoreService } from 'src/venta/core/service/core.service';

import { VentaTodasDto } from 'src/venta/core/dto/venta.todas.dto';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { constants } from 'buffer';
import { DiasService } from 'src/dias/services/dias.service';
import { diasHAbiles } from 'src/venta/core/util/dias.habiles.util';

@Injectable()
export class VentaMetasSucursalService {
  constructor(
    @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly venta: Model<Venta>,
    private readonly metasSucursalService: MetasSucursalService,
    private readonly sucursalService: SucursalService,
    private readonly coreService: CoreService,
    private readonly diasService: DiasService,
  ) {}
  async metasDeVenta(ventaDto: VentaTodasDto) {
    const filtrador = filtradorVenta(ventaDto);
    const resultados: DataMetaI[] = [];

  
    const dias = this.coreService.cantidadDias(
      ventaDto.fechaInicio,
      ventaDto.fechaFin,
    );

    const domingos = this.coreService.cantidadDomingos(
      ventaDto.fechaInicio,
      ventaDto.fechaFin,
    );

    for (const sucursal of ventaDto.sucursal) {

      
      let diasComerciales = 0;
      const meta = await this.metasSucursalService.listarMetasSucursal(
        sucursal,
        ventaDto.fechaInicio,
        ventaDto.fechaFin,
      );
      if (meta) {
        diasComerciales = meta.dias;
      }
      let [indiceDeAvanceComercial, diasHAbiles] =
        await this.indiceDeAvanceComercial(
          dias,
          sucursal,
          diasComerciales,
          domingos,
        );

      const venta = await this.venta.aggregate([
        {
          $match: {
            sucursal: new Types.ObjectId(sucursal),
            ...filtrador,
            flag: Flag.nuevo,
          },
        },
        {
          $lookup:{
            from:'Sucursal',
            foreignField:'_id',
            localField:'sucursal',
            as:'sucursal',
          }
        },
        {
          $unwind:{path:'$sucursal', preserveNullAndEmptyArrays:false} 
        },
        {
          $group: {
            _id:'$sucursal.nombre' ,
            ticket: {
              $sum: {
                $cond: {
                  if: { $eq: ['$aperturaTicket', '1'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            importe: { $sum: '$importe' },
            sucursal:{$first:'$sucursal.nombre'}
          },
        },
        {
          $project: {
            ticket: 1,
            importe: 1,
            sucursal:1
          },
        },
      ]);
   
      
      const ticketVenta = venta[0] ? venta[0].ticket : 0;
      const importVenta = venta[0] ? venta[0].importe : 0;
       const sucursalNombre = venta[0] ? venta[0].sucursal : 'Sin sucursal';
      
      const montoMeta = meta ? meta.monto : 0;
      const ticketMeta = meta ? meta.ticket : 0;
      const data: DataMetaI = {
        sucursal: sucursalNombre,
        montoMeta: montoMeta,
        ticketMeta: ticketMeta,
        ticketVenta: ticketVenta,
        importVenta: importVenta,
        cumplimientoTicket: calcularPorcentaje(ticketVenta, ticketMeta),
        cumplimientoImporte: calcularPorcentaje(importVenta, montoMeta),
        indeceAvance: indiceDeAvanceComercial,
        diasHAbiles: diasHAbiles,
      };

      resultados.push(data);
    }

    return resultados;
  }

  private async indiceDeAvanceComercial(
    dias: Date[],
    sucursal: Types.ObjectId,
    diasComerciales: number,
    domingos: number,
  ) {
    let cantidadDiasHabiles: number = 0;
    let cantidadDiasInHabiles: number = 0;
    for (const dia of dias) {
      const diasHAbiles = await this.diasService.listarDiasHabiles(
        dia,
        sucursal,
      );
      const diasInHAbiles = await this.diasService.listarDiasInhabiles(
        dia,
        sucursal,
      );
      if (diasHAbiles) {
        cantidadDiasHabiles += 1;
      }
      if (diasInHAbiles) {
        cantidadDiasInHabiles += 1;
      }
    }
    let cantidadDias: number = dias.length - domingos;
    cantidadDias += cantidadDiasHabiles;
    cantidadDias -= cantidadDiasInHabiles;
    const avance = this.coreService.reglaDeTresSimple(
      diasComerciales,
      cantidadDias,
    );
    return [avance, cantidadDias];
  }
}
