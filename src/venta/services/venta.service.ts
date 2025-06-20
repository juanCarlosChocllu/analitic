import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Venta } from '../schemas/venta.schema';
import { Model, Types } from 'mongoose';
import { VentaDto } from '../core/dto/venta.dto';

import { VentaExcelI } from '../core/interfaces/ventaExcel.interface';

import { diasHAbiles } from '../core/util/dias.habiles.util';

import { flag } from '../core/enums/flag.enum';

import { FiltroVentaI } from '../core/interfaces/filtro.venta.interface';

import { Sucursal } from 'src/sucursal/schema/sucursal.schema';

import { AbonoService } from 'src/abono/abono.service';

import { SucursalService } from 'src/sucursal/sucursal.service';

import { sucursalesEnum } from '../core/enums/sucursales.enum';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { FinalizarVentaDto } from '../core/dto/FinalizarVenta.dto';
import { VentaTodasDto } from '../core/dto/venta.todas.dto';
import { Type } from 'class-transformer';
import { EstadoEnum } from '../core/enums/estado.enum';
import { estadoLogEnum } from 'src/log/enum/estadoLog.enum';
import { flagVenta } from '../core/enums/flgaVenta.enum';

@Injectable()
export class VentaService {
  constructor(
    @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly venta: Model<Venta>,
    @InjectModel(Sucursal.name, NombreBdConexion.oc)
    private readonly sucursalExcelSchema: Model<Sucursal>,
    private readonly sucursalService: SucursalService,
  ) {}

  async ventas(ventaTodasDto: VentaTodasDto, estadoVenta: string) {
    const [venta, ventaSucursal] = await Promise.all([
      this.ventaEmpresa(ventaTodasDto, estadoVenta),
      this.ventaSucursal(ventaTodasDto, estadoVenta),
    ]);
    const total = venta.reduce((total, ve) => total + ve.importe, 0);
    const cantidad = venta.reduce((total, ve) => total + ve.cantidad, 0);
    const ticketPromedio = this.ticketPromedio(total, cantidad);
    const resultado = {
      cantidadSucursal: ventaSucursal.cantidadSucursal,
      fechaInicio: ventaTodasDto.fechaInicio,
      fechaFin: ventaTodasDto.fechaFin,
      total,
      cantidad,
      ticketPromedio,
      venta,
      ventaSucursal,
    };

    return resultado;
  }

  private async ventaEmpresa(
    ventaTodasDto: VentaTodasDto,
    estadoVenta: string,
  ) {
    const filtrador: FiltroVentaI = this.filterPorEmpresa(
      ventaTodasDto,
      estadoVenta,
    );

    const venta = await this.venta.aggregate([
      {
        $match: {
          ...filtrador,
        },
      },
      {
        $lookup: {
          from: 'Sucursal',
          foreignField: '_id',
          localField: 'sucursal',
          as: 'sucursal',
        },
      },
      {
        $unwind: '$sucursal',
      },
      {
        $match: {
          'sucursal.nombre': { $ne: 'OPTICENTRO PARAGUAY' },
        },
      },
      {
        $group: {
          _id: '$producto',
          cantidad: { $sum: '$cantidad' },
          importe: { $sum: '$importe' },
        },
      },
      {
        $project: {
          _id: 0,
          producto: '$_id',
          cantidad: 1,
          importe: 1,
          montoTotal: 1,
          descuento: 1,
          ventas: 1,
        },
      },
    ]);

    return venta;
  }

  private async ventaSucursal(
    ventaTodasDto: VentaTodasDto,
    estadoVenta: string,
  ) {
    const sucursales: Types.ObjectId[] = [];
    const ventaSucursal: any[] = [];
    const filtrador: FiltroVentaI = this.filterPorSucursal(
      ventaTodasDto,
      estadoVenta,
    );

    if (ventaTodasDto.sucursal.length == 0) {
      for (const e of ventaTodasDto.empresa) {
        const sucursal = await this.sucursalService.sucursalListaEmpresas(
          new Types.ObjectId(e),
        );

        sucursales.push(...sucursal.map((item) => item._id));
      }
    } else {
      sucursales.push(...ventaTodasDto.sucursal);
    }

    for (let sucursal of sucursales) {
      filtrador.sucursal = new Types.ObjectId(sucursal);
      const venta = await this.venta.aggregate([
        {
          $match: {
            ...filtrador,
          },
        },
        {
          $lookup: {
            from: 'Sucursal',
            foreignField: '_id',
            localField: 'sucursal',
            as: 'sucursal',
          },
        },
        {
          $unwind: '$sucursal',
        },
        {
          $group: {
            _id: '$producto',
            cantidad: { $sum: '$cantidad' },
            montoTotal: {
              $sum: '$importe',
            },
          },
        },
        {
          $project: {
            producto: '$_id.producto',
            sucursal: '$_id.sucursal',
            asesor: 1,
            cantidad: 1,
            montoTotal: 1,
            totalImporte: 1,
          },
        },
      ]);
      const resultado = {
        sucursal: await this.extraerSucursal(sucursal),
        data: venta.map((elemeto) => {
          return {
            producto: elemeto._id,
            cantidad: elemeto.cantidad,
            montoTotal: elemeto.montoTotal,
          };
        }),
      };
      ventaSucursal.push(resultado);
    }

    const data = this.calcularDatosSucursal(ventaSucursal, ventaTodasDto);
    const resultado = {
      data,
      ventaSucursal,
      cantidadSucursal: sucursales.length,
    };
    return resultado;
  }

  private calcularDatosSucursal(
    ventaPorSucursal: any[],
    ventaTodasDto: VentaTodasDto,
  ) {
    const dias = diasHAbiles(ventaTodasDto.fechaInicio, ventaTodasDto.fechaFin);

    const totalVenta: number[] = [];
    const cantidadTotal: number[] = [];

    for (let venta of ventaPorSucursal) {
      if (
        ventaPorSucursal.length > 0 &&
        venta.sucursal != sucursalesEnum.opticentroParaguay
      ) {
        const total = this.total(venta.data);
        const cantidad = this.cantidadTotal(venta.data);
        totalVenta.push(total);
        cantidadTotal.push(cantidad);
      } else if (
        ventaTodasDto.sucursal.length == 1 &&
        venta.sucursal == sucursalesEnum.opticentroParaguay
      ) {
        const total = this.total(venta.data);
        const cantidad = this.cantidadTotal(venta.data);
        totalVenta.push(total);
        cantidadTotal.push(cantidad);
      }
    }
    const total = totalVenta
      .reduce((total, venta) => total + venta, 0)
      .toFixed(2);
    const cantidad = cantidadTotal.reduce(
      (total, cantidad) => total + cantidad,
      0,
    );
    const ticketPromedio = this.ticketPromedio(parseFloat(total), cantidad);
    const ventaPorDia = parseFloat((parseFloat(total) / dias).toFixed(2));
    this.ticketPromedio;
    const resultado = {
      total,
      cantidad,
      ventaPorDia,
      ticketPromedio,
    };
    return resultado;
  }

  private cantidadTotal(venta: any[]) {
    const cantidad = venta.reduce(
      (total: number, venta: VentaExcelI) => total + venta.cantidad,
      0,
    );
    return cantidad;
  }
  private total(venta: any[]) {
    const total = venta.reduce(
      (total: number, venta: VentaExcelI) => total + venta.montoTotal,
      0,
    );

    return total;
  }

  private ticketPromedio(totalVenta: number, cantidadTotaVenta: number) {
    const tkPromedio = totalVenta / cantidadTotaVenta;
    return tkPromedio ? parseFloat(tkPromedio.toFixed(2)) : 0;
  }

  private async extraerSucursal(sucursal: Types.ObjectId) {
    const su = await this.sucursalExcelSchema
      .findOne({ _id: sucursal })
      .select('nombre');
    return su.nombre;
  }

  async crearVenta(data: any) {
    await this.venta.create(data);
  }

  async finalizarVentas(finalizarVentaDto: FinalizarVentaDto) {
    try {
      const venta = await this.venta.findOne({
        numeroTicket: finalizarVentaDto.idVenta.toUpperCase().trim(),
      });
      if (venta) {
        await this.venta.updateMany(
          { numeroTicket: finalizarVentaDto.idVenta.toUpperCase().trim() },
          {
            fecha: new Date(finalizarVentaDto.fecha),
            estadoTracking: finalizarVentaDto.tracking,
            flagVenta: finalizarVentaDto.flag,
          },
        );
        return { status: HttpStatus.OK };
      }
      return { status: HttpStatus.NOT_FOUND };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  private filterPorEmpresa(ventaTodasDto: VentaTodasDto, estado: string) {
    const filtrador: FiltroVentaI = {
      empresa: {
        $in: ventaTodasDto.empresa.map((item) => new Types.ObjectId(item)),
      },
    };

    if (ventaTodasDto.flagVenta === EstadoEnum.finalizadas) {
      filtrador.flagVenta = { $eq: EstadoEnum.finalizadas };
      filtrador.fecha = {
        $gte: new Date(
          new Date(ventaTodasDto.fechaInicio).setUTCHours(0, 0, 0, 0),
        ),
        $lte: new Date(
          new Date(ventaTodasDto.fechaFin).setUTCHours(23, 59, 59, 999),
        ),
      };
    }

    if (ventaTodasDto.flagVenta === EstadoEnum.realizadas) {
      if (estado == 'ACTUAL') {
        filtrador.flagVenta = { $ne: EstadoEnum.finalizadas };
      }

      filtrador.fechaVenta = {
        $gte: new Date(
          new Date(ventaTodasDto.fechaInicio).setUTCHours(0, 0, 0, 0),
        ),
        $lte: new Date(
          new Date(ventaTodasDto.fechaFin).setUTCHours(23, 59, 59, 999),
        ),
      };
    }

    ventaTodasDto.tipoVenta.length > 0
      ? (filtrador.tipoVenta = {
          $in: ventaTodasDto.tipoVenta.map((id) => new Types.ObjectId(id)),
        })
      : filtrador;
              console.log(estado, filtrador);
    return filtrador;
  }
  private filterPorSucursal(ventaTodasDto: VentaTodasDto, estado: string) {
    const filtrador: FiltroVentaI = {};

    if (ventaTodasDto.flagVenta === EstadoEnum.finalizadas) {
      filtrador.flagVenta = { $eq: EstadoEnum.finalizadas };
      filtrador.fecha = {
        $gte: new Date(
          new Date(ventaTodasDto.fechaInicio).setUTCHours(0, 0, 0, 0),
        ),
        $lte: new Date(
          new Date(ventaTodasDto.fechaFin).setUTCHours(23, 59, 59, 999),
        ),
      };
    }

    if (ventaTodasDto.flagVenta === EstadoEnum.realizadas) {
      if (estado == 'ACTUAL') {
        filtrador.flagVenta = { $ne: EstadoEnum.finalizadas };
      }

      filtrador.fechaVenta = {
        $gte: new Date(
          new Date(ventaTodasDto.fechaInicio).setUTCHours(0, 0, 0, 0),
        ),
        $lte: new Date(
          new Date(ventaTodasDto.fechaFin).setUTCHours(23, 59, 59, 999),
        ),
      };
    }
    ventaTodasDto.tipoVenta.length > 0
      ? (filtrador.tipoVenta = {
          $in: ventaTodasDto.tipoVenta.map((id) => new Types.ObjectId(id)),
        })
      : filtrador;

      
    return filtrador;
  }
}
