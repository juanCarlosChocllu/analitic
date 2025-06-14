import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AsesoresService } from 'src/asesores/asesores.service';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { Sucursal } from 'src/sucursal/schema/sucursal.schema';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { InformacionVentaDto } from 'src/venta/core/dto/informacion.venta.dto';
import { VentaDto } from 'src/venta/core/dto/venta.dto';
import { VentaTodasDto } from 'src/venta/core/dto/venta.todas.dto';
import { sucursalesEnum } from 'src/venta/core/enums/sucursales.enum';
import { AsesorExcelI } from 'src/venta/core/interfaces/asesor.interface';
import { FiltroVentaI } from 'src/venta/core/interfaces/filtro.venta.interface';
import { CoreService } from 'src/venta/core/service/core.service';
import { diasHAbiles } from 'src/venta/core/util/dias.habiles.util';
import { filtradorDeGestion } from 'src/venta/core/util/filtrador.gestion.util';
import { filtradorKpiInformacion } from 'src/venta/core/util/filtrador.kpi.informacion.util';
import { filtradorVenta } from 'src/venta/core/util/filtrador.venta.util';
import { ticketPromedio } from 'src/venta/core/util/tickectPromedio.util';
import { Venta } from 'src/venta/schemas/venta.schema';

@Injectable()
export class VentaAsesoresService {
  constructor(
    @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<Venta>,
    @InjectModel(Sucursal.name, NombreBdConexion.oc)
    private readonly sucursalExcelSchema: Model<Sucursal>,
    private readonly sucursalService: SucursalService,
    private readonly asesoresService: AsesoresService,
    private readonly coreService: CoreService,
  ) {}

  public async indicadoresPorAsesor(VentaTodasDto: VentaTodasDto) {
    const listaAsesor: AsesorExcelI[] = [];
    const filtrador = filtradorVenta(VentaTodasDto);
    let sucursales: SucursalI[] =
      await this.coreService.filtroParaTodasEmpresas(VentaTodasDto);

    for (let sucursal of sucursales) {
      const sucur = await this.sucursalService.listarSucursalId(sucursal._id);
      if (sucur.nombre != sucursalesEnum.opticentroParaguay) {
        const asesores: AsesorExcelI[] =
          await this.asesoresService.listarAsesorPorSucursal(sucursal._id);
        listaAsesor.push(...asesores);
      } else if (sucur.nombre == sucursalesEnum.opticentroParaguay) {
        const asesores: AsesorExcelI[] =
          await this.asesoresService.listarAsesorPorSucursal(sucursal._id);
        listaAsesor.push(...asesores);
      }
    }
    const ventaPorAsesor = await this.ventaPorAsesores(listaAsesor, filtrador);
    return ventaPorAsesor;
  }

  private async ventaPorAsesores(
    asesores: AsesorExcelI[],
    filtrador: FiltroVentaI,
  ) {
    const venPorAsesor: any[] = [];
    for (let asesor of asesores) {
      const sucursal = await this.sucursalExcelSchema
        .findOne({ _id: asesor.sucursal })
        .select('nombre');

      const asesorNombre = await this.asesoresService.asesorFindOne(asesor.id);
      const resultado = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            asesor: new Types.ObjectId(asesor.id),
            ...filtrador,
          },
        },
        {
          $group: {
            _id: null,
            ventaTotal: {
              $sum: {
                $cond: {
                  if: { $eq: ['$aperturaTicket', '1'] },
                  then: '$montoTotal',
                  else: 0,
                },
              },
            },
            totalTicket: {
              $sum: {
                $cond: {
                  if: { $eq: ['$aperturaTicket', '1'] },
                  then: 1,
                  else: 0,
                },
              },
            },
            cantidad: {
              $sum: '$cantidad',
            },
            totalImporte: { $sum: '$importe' },
          },
        },
        {
          $project: {
            ventaTotal: 1,
            cantidad: 1,
            totalTicket: 1,
            importeTotalSuma: '$totalImporte',

            ticketPromedio: {
              $cond: {
                if: { $ne: ['$totalTicket', 0] },
                then: {
                  $round: [{ $divide: ['$ventaTotal', '$totalTicket'] }, 2],
                },
                else: 0,
              },
            },

            precioPromedio: {
              $cond: {
                if: { $ne: ['$cantidad', 0] },
                then: {
                  $round: [{ $divide: ['$ventaTotal', '$cantidad'] }, 2],
                },
                else: 0,
              },
            },
            unidadPorTicket: {
              $cond: {
                if: { $ne: ['$cantidad', 0] },
                then: {
                  $round: [{ $divide: ['$cantidad', '$totalTicket'] }, 2],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      const resultadoFinal =
        resultado.length > 0
          ? resultado[0]
          : {
              _id: null,
              unidadPorTicket: 0,
              importeTotalSuma: 0,
              ventaTotal: 0,
              cantidad: 0,
              totalTicket: 0,
              ticketPromedio: 0,
              precioPromedio: 0,
            };

      const data = {
        sucursal: sucursal.nombre,
        asesor: asesorNombre.usuario,
        ...resultadoFinal,
      };

      venPorAsesor.push(data);
    }

    return venPorAsesor;
  }

  public async indicadoresPorSucursal(VentaTodasDto: VentaTodasDto) {
    const filtrador = filtradorVenta(VentaTodasDto);

    const dataSucursal: any[] = [];
    let sucursales: SucursalI[] =
      await this.coreService.filtroParaTodasEmpresas(VentaTodasDto);

    let dias: number = diasHAbiles(
      VentaTodasDto.fechaInicio,
      VentaTodasDto.fechaFin,
    );
    dias <= 0 ? (dias = 1) : dias;

    const data = {
      sucursales: 0,
      totalVentas: 0,
      tcPromedio: 0,
      ventaDiariaPorLocal: 0,
      unidadPorTickect: 0,
      ticketPromedio: 0,
      tasaConversion: 0,
    };

    for (let sucursal of sucursales) {
      const indicadorData = await this.idicadorSucursal(
        sucursal._id,
        filtrador,
      );
      dataSucursal.push(indicadorData);
    }

    const traficoCliente = dataSucursal.reduce(
      (total, item) => total + item.traficoCliente,
      0,
    );
    const cantidad = dataSucursal.reduce(
      (total, item) => total + item.cantidad,
      0,
    );
    const ticket = dataSucursal.reduce(
      (total, item) => total + item.totalTicket,
      0,
    );
    const totalVenta = dataSucursal.reduce(
      (total, item) => total + item.ventaTotal,
      0,
    );
    data.sucursales = sucursales.length;
    data.totalVentas = totalVenta;

    data.unidadPorTickect = parseFloat((cantidad / ticket).toFixed(2))
      ? parseFloat((cantidad / ticket).toFixed(2))
      : 0;
    data.ventaDiariaPorLocal = parseFloat((totalVenta / dias).toFixed(2));

    data.ticketPromedio = ticketPromedio(totalVenta, cantidad);

    data.tcPromedio =
      (traficoCliente / ticket) * 100 ? (traficoCliente / ticket) * 100 : 0;
    const resultado = {
      ...data,
      dataSucursal,
    };
    return resultado;
  }

  private async idicadorSucursal(
    idsucursal: Types.ObjectId,
    filtrador: FiltroVentaI,
  ) {
    const sucursal = await this.sucursalService.listarSucursalId(idsucursal);
    const sucusarsalData = await this.VentaExcelSchema.aggregate([
      {
        $match: {
          sucursal: new Types.ObjectId(idsucursal),
          ...filtrador,
        },
      },
      {
        $group: {
          _id: '$sucursal',
          ventaTotal: {
            $sum: {
              $cond: {
                if: { $eq: ['$aperturaTicket', '1'] },
                then: '$montoTotal',
                else: 0,
              },
            },
          },
          totalTicket: {
            $sum: {
              $cond: {
                if: { $eq: ['$aperturaTicket', '1'] },
                then: 1,
                else: 0,
              },
            },
          },
          traficoCliente: {
            $sum: {
              $cond: {
                if: { $eq: ['$aperturaTicket', '1'] },
                then: 1,
                else: 0,
              },
            },
          },
          totalImporte: { $sum: '$importe' },
          cantidad: { $sum: '$cantidad' },
        },
      },
      {
        $project: {
          _id: 0,
          ventaTotal: 1,
          totalTicket: 1,
          traficoCliente: 1,
          totalImporte: 1,
          cantidad: 1,

          ticketPromedio: {
            $cond: {
              if: { $ne: ['$totalTicket', 0] },
              then: {
                $round: [{ $divide: ['$ventaTotal', '$totalTicket'] }, 2],
              },
              else: 0,
            },
          },
          unidadPorTicket: {
            $cond: {
              if: { $ne: ['$cantidad', 0] },
              then: {
                $round: [{ $divide: ['$cantidad', '$totalTicket'] }, 2],
              },
              else: 0,
            },
          },

          precioPromedio: {
            $cond: {
              if: { $ne: ['$ventaTotal', 0] },
              then: {
                $round: [{ $divide: ['$ventaTotal', '$cantidad'] }, 2],
              },
              else: 0,
            },
          },

          tasaConversion: {
            $cond: {
              if: { $ne: ['$traficoCliente', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalTicket', '$traficoCliente'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              else: 0,
            },
          },
        },
      },
    ]);
    const resultadoFinal =
      sucusarsalData.length > 0
        ? sucusarsalData[0]
        : {
            _id: null,
            traficoCliente: 0,
            ventaTotal: 0,
            totalTicket: 0,
            cantidad: 0,
            ticketPromedio: 0,
            unidadPorTicket: 0,
            precioPromedio: 0,
            totalImporte: 0,
          };

    const data = {
      sucursal: sucursal.nombre,
      id: sucursal._id,
      ...resultadoFinal,
    };
    return data;
  }

  public async sucursalVentaInformacion(
    id: string,
    informacionVentaDto: InformacionVentaDto,
  ) {
    let filtrador: FiltroVentaI = {
      fecha: {
        $gte: new Date(informacionVentaDto.fechaInicio),
        $lte: new Date(informacionVentaDto.fechaFin),
      },
    };
    if (informacionVentaDto.comisiona != null) {
      filtrador.comisiona = informacionVentaDto.comisiona;
    }
    const ventaSucursal = await this.VentaExcelSchema.aggregate([
      {
        $match: {
          sucursal: new Types.ObjectId(id),
          ...filtrador,
        },
      },
      {
        $group: {
          _id: '$producto',
          cantidad: {
            $sum: '$cantidad',
          },
          totalImporte: {
            $sum: '$importe',
          },
        },
      },
      {
        $project: {
          _id: 1,
          cantidad: 1,
          totalImporte: 1,
        },
      },
    ]);
    return ventaSucursal;
  }

  public async indicadoresPorFecha(ventaDto: VentaDto) {
    const filtrador = filtradorVenta(ventaDto);
    const data: any[] = [];
    for (let su of ventaDto.sucursal) {
      const sucursal = await this.sucursalService.listarSucursalId(su);
      const venta = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            sucursal: new Types.ObjectId(su),
            ...filtrador,
          },
        },
        {
          $group: {
            _id: {
              aqo: { $year: '$fecha' },
              mes: { $month: '$fecha' },
              dia: { $dayOfMonth: '$fecha' },
            },
            fecha: { $first: '$fecha' },
            tickets: {
              $sum: {
                $cond: {
                  if: { $eq: ['$aperturaTicket', '1'] },
                  then: 1,
                  else: 0,
                },
              },
            },
            cantidad: {
              $sum: '$cantidad',
            },
            importe: {
              $sum: '$importe',
            },
            ventaTotal: {
              $sum: {
                $cond: {
                  if: { $eq: ['$aperturaTicket', '1'] },
                  then: '$montoTotal',
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            fecha: 1,
            tickets: 1,
            ventaTotal: 1,
            cantidad: 1,
            totalImporte: '$importe',
            ticketPromedio: {
              $cond: {
                if: { $ne: ['$tickets', 0] },
                then: {
                  $round: [{ $divide: ['$ventaTotal', '$tickets'] }, 2],
                },
                else: 0,
              },
            },
            unidadPorTicket: {
              $cond: {
                if: { $ne: ['$cantidad', 0] },
                then: {
                  $round: [{ $divide: ['$cantidad', '$tickets'] }, 2],
                },
                else: 0,
              },
            },
            precioPromedio: {
              $cond: {
                if: { $ne: ['$ventaTotal', 0] },
                then: {
                  $round: [{ $divide: ['$ventaTotal', '$cantidad'] }, 2],
                },
                else: 0,
              },
            },

            tasaConversion: {
              $sum: 0,
            },
          },
        },
      ]);
      const resultado = {
        sucursal: sucursal.nombre,
        id: sucursal._id,
        venta,
      };
      data.push(resultado);
    }
    return data;
  }
}
