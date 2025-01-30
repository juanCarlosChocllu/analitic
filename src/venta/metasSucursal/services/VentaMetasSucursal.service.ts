import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flag } from 'src/core/enums/flag';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { MetasSucursalService } from 'src/metas-sucursal/metas-sucursal.service';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { calcularPorcentaje } from 'src/venta/core/util/calcularPorcentaje';

import { Venta } from 'src/venta/schemas/venta.schema';
import { DataMetaI } from '../interface/dataMeta';
import { filtradorVenta } from 'src/venta/core/util/filtrador.venta.util';
import { CoreService } from 'src/venta/core/service/core.service';
import { VentaTodasDto } from 'src/venta/dto/venta.todas.dto';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { constants } from 'buffer';

@Injectable()
export class VentaMetasSucursalService {
  constructor(
    @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly venta: Model<Venta>,
    private readonly metasSucursalService: MetasSucursalService,
    private readonly sucursalService: SucursalService,
    private readonly coreService: CoreService,
  ) {}
  async metasDeVenta(ventaDto: VentaTodasDto) {
    const filtrador = filtradorVenta(ventaDto);
    const resultados: DataMetaI[] = [];

    for (const empresa of ventaDto.empresa) {
      let sucursales: SucursalI[] = [];
      if (ventaDto.empresa.length > 1) {
        sucursales = await this.sucursalService.sucursalListaEmpresas(
          new Types.ObjectId(empresa),
        );
      } else {
        for (const sucursal of ventaDto.sucursal) {
          sucursales.push(
            await this.sucursalService.listarSucursalId(sucursal),
          );
        }
      }

      const su = await this.coreService.filtroSucursal(
        sucursales.map((item) => item._id),
      );

      for (const sucursal of su) {
        const meta = await this.metasSucursalService.listarMestasSucursal(
          sucursal._id,
          ventaDto.fechaInicio,
          ventaDto.FechaFin,
        );

        const venta = await this.venta.aggregate([
          {
            $match: {
              sucursal: new Types.ObjectId(sucursal._id),
              ...filtrador,
              flag: Flag.nuevo,
            },
          },

          {
            $group: {
              _id: null,
              ticket: {
                $sum: {
                  $cond: {
                    if: { $eq: ['$aperturaTicket', '1'] },
                    then: '$cantidad',
                    else: 0,
                  },
                },
              },
              importe: {
                $sum: {
                  $cond: {
                    if: { $ne: ['$producto', 'DESCUENTO'] },
                    then: '$importe',
                    else: 0,
                  },
                },
              },
            },
          },
          {
            $project: {
              ticket: 1,
              importe: 1,
            },
          },
        ]);
        const ticketVenta = venta[0] ? venta[0].ticket : 0;
        const importVenta = venta[0] ? venta[0].importe : 0;

        const montoMeta = meta ? meta.monto : 0;
        const ticketMeta = meta ? meta.ticket : 0;

        const data: DataMetaI = {
          sucursal: sucursal.nombre,
          montoMeta: montoMeta,
          ticketMeta: ticketMeta,
          ticketVenta: ticketVenta,
          importVenta: importVenta,
          cumplimientoTicket: calcularPorcentaje(ticketVenta, ticketMeta),
          cumplimientoImporte: calcularPorcentaje(importVenta, montoMeta),
        };

        resultados.push(data);
      }
    }

    return resultados;
  }
}
