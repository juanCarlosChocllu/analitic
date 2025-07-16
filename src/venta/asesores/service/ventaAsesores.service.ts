import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { AsesoresService } from 'src/asesores/asesores.service';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { Sucursal } from 'src/sucursal/schema/sucursal.schema';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { InformacionVentaDto } from 'src/venta/core/dto/informacion.venta.dto';
import { VentaDto } from 'src/venta/core/dto/venta.dto';
import { VentaTodasDto } from 'src/venta/core/dto/venta.todas.dto';
import { FlagVentaE } from 'src/venta/core/enums/estado.enum';
import { sucursalesEnum } from 'src/venta/core/enums/sucursales.enum';
import { AsesorExcelI } from 'src/venta/core/interfaces/asesor.interface';
import { FiltroVentaI } from 'src/venta/core/interfaces/filtro.venta.interface';
import { CoreService } from 'src/venta/core/service/core.service';
import { diasHAbiles } from 'src/venta/core/util/dias.habiles.util';
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
    const filtrador = filtradorVenta(VentaTodasDto);
    let sucursales: SucursalI[] =
      await this.coreService.filtroParaTodasEmpresas(VentaTodasDto);
    const data = await Promise.all(
      sucursales.map(async (sucursal) => {
        const sucur = await this.sucursalService.listarSucursalId(sucursal._id);
        if (sucur.nombre != sucursalesEnum.opticentroParaguay) {
          const asesores: AsesorExcelI[] =
            await this.asesoresService.listarAsesorPorSucursal(sucursal._id);
          return asesores;
        } else if (sucur.nombre == sucursalesEnum.opticentroParaguay) {
          const asesores: AsesorExcelI[] =
            await this.asesoresService.listarAsesorPorSucursal(sucursal._id);
          return asesores;
        }
      }),
    );

    const ventaPorAsesor = await this.ventaPorAsesores(data.flat(), filtrador);
    return ventaPorAsesor;
  }

  private async ventaPorAsesores(
    asesores: AsesorExcelI[],
    filtrador: FiltroVentaI,
  ) {
    const venPorAsesor: any[] = [];
    for (let asesor of asesores) {
      const pipline: PipelineStage[] = [
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
      ];

      const [sucursal, resultado] = await Promise.all([
        this.sucursalExcelSchema
          .findOne({ _id: asesor.sucursal })
          .select('nombre'),
        this.VentaExcelSchema.aggregate(pipline),
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
        asesor: asesor.usuario,
        ...resultadoFinal,
      };

      venPorAsesor.push(data);
    }

    return venPorAsesor;
  }

  public async indicadoresPorSucursal(VentaTodasDto: VentaTodasDto) {
    const filtrador = filtradorVenta(VentaTodasDto);

    const sucursales = await  this.coreService.filtroParaTodasEmpresas(VentaTodasDto)
    const  dataDiaria = await this.ventasSucursalDiaria(sucursales,filtrador, VentaTodasDto.flagVenta)


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
    const dataSucursal = await Promise.all(
      sucursales.map((item) => this.idicadorSucursal(item._id, filtrador)),
    );

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
      dataDiaria,
    };
    return resultado;
  }

  private async idicadorSucursal(
    idsucursal: Types.ObjectId,
    filtrador: FiltroVentaI,
  ) {
    const pipline: PipelineStage[] = [
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
    ];
    const [sucursal, sucusarsalData] = await Promise.all([
      this.sucursalService.listarSucursalId(idsucursal),
      this.VentaExcelSchema.aggregate(pipline),
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

  private async ventasSucursalDiaria(sucursales:SucursalI[],filtrador:FiltroVentaI,flagVenta:string) {

    const agrupacion =
      flagVenta === FlagVentaE.finalizadas
        ? {
            aqo: { $year: '$fecha' },
            mes: { $month: '$fecha' },
            dia: { $dayOfMonth: '$fecha' },
          }
        : {
            aqo: { $year: '$fechaVenta' },
            mes: { $month: '$fechaVenta' },
            dia: { $dayOfMonth: '$fechaVenta' },
          };

    const ventas = await this.VentaExcelSchema.aggregate([
      {
        $match: {
          sucursal: {
            $in: sucursales.map((item) => new Types.ObjectId(item._id)),
          },
          ...filtrador,
        },
      },

      {
        $group: {
          _id: {
            ...agrupacion,
          },
          cantidad: { $sum: '$cantidad' },
          tickets: {
            $sum: {
              $cond: {
                if: { $eq: ['$aperturaTicket', '1'] },
                then: 1,
                else: 0,
              },
            },
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

          importe: {
            $sum: '$importe',
          },
        },
      },
      {
        $project: {
          _id: 0,
          fecha: {
            $concat: [
              { $toString: '$_id.aqo' },
              '-',
              { $toString: '$_id.mes' },
              '-',
              { $toString: '$_id.dia' },
            ],
          },
          cantidad: 1,
          tickets: 1,
          ventaTotal: 1,
          importe: 1,
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
        },
      },
    ]);

    return ventas;
  }

  public async sucursalVentaInformacion(
    id: string,
    informacionVentaDto: InformacionVentaDto,
  ) {
    
    
    let filtrador: FiltroVentaI = {
      estadoTracking:{$ne:'ANULADO'}
    };
    if (informacionVentaDto.comisiona != null) {
      filtrador.comisiona = informacionVentaDto.comisiona;
    }
    if (informacionVentaDto.flagVenta === FlagVentaE.finalizadas) {
      filtrador.fecha = {
         $gte: new Date(new Date(informacionVentaDto.fechaInicio).setUTCHours(0,0,0)),
        $lte: new Date(new Date(informacionVentaDto.fechaFin).setUTCHours(23,59,59)),
      };
    }

    if (informacionVentaDto.flagVenta === FlagVentaE.realizadas) {
      filtrador.fechaVenta = {
        $gte: new Date(new Date(informacionVentaDto.fechaInicio).setUTCHours(0,0,0)),
        $lte: new Date(new Date(informacionVentaDto.fechaFin).setUTCHours(23,59,59)),
      };
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
