import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types,PipelineStage } from 'mongoose';
import { AsesoresService } from 'src/asesores/asesores.service';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { Sucursal } from 'src/sucursal/schema/sucursal.schema';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { InformacionVentaDto } from 'src/venta/core/dto/informacion.venta.dto';
import { VentaDto } from 'src/venta/core/dto/venta.dto';
import { VentaTodasDto } from 'src/venta/core/dto/venta.todas.dto';
import { EstadoVentaE, FlagVentaE } from 'src/venta/core/enums/estado.enum';
import { flagVenta } from 'src/venta/core/enums/flgaVenta.enum';
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

  public async indicadoresPorSucursal(ventaTodasDto: VentaTodasDto) {
    const filtrador = filtradorVenta(ventaTodasDto);
    const agrupacion= ventaTodasDto.flagVenta === FlagVentaE.realizadas ?   {
              aqo: { $year: '$fechaVenta' },
              mes: { $month: '$fechaVenta' },
              dia: { $dayOfMonth: '$fechaVenta' },
            } : {
              aqo: { $year: '$fecha' },
              mes: { $month: '$fecha' },
              dia: { $dayOfMonth: '$fecha' },
            }
        
            
    const ventas:any[]=[];
    for (const su of ventaTodasDto.sucursal) {
      const pipeline:PipelineStage[] = [
        {
          $match: {
            sucursal: new Types.ObjectId(su),
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
          $group: {
            _id: {
              ...agrupacion
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
            importeTotal: { $sum: '$importe' },
            tickets: {
              $sum: {
                $cond: {
                  if: { $eq: ['$aperturaTicket', '1'] },
                  then: 1,
                  else: 0,
                },
              },
            },
            cantidad: { $sum: '$cantidad' },
          },
        },
        {
          $project: {
            _id:0,
            fecha: {
              $concat: [
                { $toString: '$_id.aqo' },
                '-',
                { $toString: '$_id.mes' },
                '-',
                { $toString: '$_id.dia' },
              ],
            },
            ventaTotal: 1,
            importeTotal: 1,
            tickets: 1,
            cantidad: 1,
            ticketPromedio: {
              $cond: {
                if: { $ne: ['$tickets', 0] },
                then: {
                  $round: [{ $divide: ['$ventaTotal', '$tickets'] }, 2],
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

            unidadPorTicket: {
              $cond: {
                if: { $ne: ['$cantidad', 0] },
                then: {
                  $round: [{ $divide: ['$cantidad', '$tickets'] }, 2],
                },
                else: 0,
              },
            },
          },
        },
      ]
      const [sucursal,venta]=await Promise.all([
        this.sucursalService.listarSucursalId(new Types.ObjectId(su)),
        this.VentaExcelSchema.aggregate(pipeline)
      ])
      ventas.push({sucursal:sucursal.nombre, data:venta})
    }

    return ventas;
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
    if (informacionVentaDto.flagVenta === FlagVentaE.finalizadas) {
      filtrador.flagVenta = { $eq: FlagVentaE.finalizadas };
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
