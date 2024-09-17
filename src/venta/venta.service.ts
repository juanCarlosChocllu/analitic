import {
  HttpStatus,
  Injectable,
  Logger,

} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AsesorExcel,
  VentaExcel,
} from './schemas/venta.schema';
import { Model, set, Types } from 'mongoose';
import {VentaExcelDto } from './dto/venta.dto';
import { SucursalService } from 'src/sucursal/sucursal.service';


import { VentaExcelI } from './interfaces/ventaExcel.interface';

import { NombreBdConexion } from 'src/enums/nombre.db.enum';

import { AsesorExcelI } from './interfaces/asesor.interface';



import { diasHAbiles } from './util/dias.habiles.util';
import { informacionVentaDto } from './dto/informacion.venta.dto';

import { abonoI } from 'src/abono/interfaces/abono.interface';
import { flag } from './enums/flag.enum';

import { Abono } from 'src/abono/schema/abono.abono';

import { FiltroVentaI } from './interfaces/filtro.venta.interface';

import { EstadoEnum } from './enums/estado.enum';
import { productos } from './enums/productos.enum';

import { SuscursalExcel } from 'src/sucursal/schema/sucursal.schema';

@Injectable()
export class VentaService {
  private readonly logger = new Logger(VentaExcel.name);
  constructor(

    @InjectModel(VentaExcel.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<VentaExcel>,
    @InjectModel(SuscursalExcel.name, NombreBdConexion.oc)
    private readonly sucursalExcelSchema: Model<SuscursalExcel>,
    @InjectModel(AsesorExcel.name, NombreBdConexion.oc)
    private readonly AsesorExcelSchema: Model<AsesorExcel>,
    @InjectModel(Abono.name, NombreBdConexion.oc)
    private readonly AbonoSchema: Model<Abono>,

    private readonly sucursalService: SucursalService,

  ) {}

  public async vericarVentaParaCadaAbono(abono: abonoI[]) {
    for (let data of abono) {
      const venta = await this.VentaExcelSchema.findOne({
        numeroTicket: data.numeroTicket,
        flagVenta: { $ne: flag.FINALIZADO },
      });
      if (venta) {
        const abonoExiste = await this.AbonoSchema.find({
          numeroTicket: venta.numeroTicket,
        }).exec();
        if (abonoExiste.length > 0) {
          const total = abonoExiste.reduce((total, a) => total + a.monto, 0);
          if (venta.montoTotal < total) {
            const dataAbono: abonoI = {
              numeroTicket: data.numeroTicket,
              monto: data.monto,
              fecha: data.fecha,
              flag: data.flag,
            };
            return await this.AbonoSchema.create(dataAbono);
          }
          return;
        }
        const dataAbono: abonoI = {
          numeroTicket: data.numeroTicket,
          monto: data.monto,
          fecha: data.fecha,
          flag: data.flag,
        };
        return await this.AbonoSchema.create(dataAbono);
      }
    }
  }

  public async finalizarVentas() {
    const fechaFin = new Date();
    const fechaInicio = new Date(fechaFin);
    fechaInicio.setDate(fechaInicio.getDate() - 7);
    const venta = await this.VentaExcelSchema.find({
      fecha: {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin),
      },
      flagVenta: { $ne: flag.FINALIZADO },
      aperturaTicket: '1',
    });

    if (venta) {
      for (let data of venta) {
        const abono = await this.AbonoSchema.find({
          numeroTicket: data.numeroTicket,
        });
        const total = abono.reduce((total, a) => total + a.monto, 0);
        if (data.montoTotal === total) {
          await this.VentaExcelSchema.updateMany(
            { numeroTicket: data.numeroTicket },
            { $set: { flagVenta: flag.FINALIZADO } },
          );
        }
      }
    }
    return { status: HttpStatus.OK };
  }



  async ventaExel(ventaDto: VentaExcelDto) {
    const venta = await this.ventaExcel(ventaDto);
    const ventaSucursal = await this.ventaExcelSucursal(ventaDto);
    const total = venta.reduce((total, ve) => total + ve.montoTotal, 0);
    const cantidad = venta.reduce((total, ve) => total + ve.cantidad, 0);
    const ticketPromedio = this.ticketPromedio(total, cantidad);

    const resultado = {
      cantidadSucursal: ventaDto.sucursal.length,
      fechaInicio: ventaDto.fechaInicio,
      fechaFin: ventaDto.FechaFin,
      total,
      cantidad,
      ticketPromedio,
      venta,
      ventaSucursal,
    };
 
    return resultado;
  }

  private async ventaExcel(ventaDto: VentaExcelDto) {


    const venta = await this.VentaExcelSchema.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(ventaDto.fechaInicio),
            $lte: new Date(ventaDto.FechaFin),
          },
          empresa: new Types.ObjectId(ventaDto.empresa),
          producto: { $ne: 'DESCUENTO' },
        },
      },
      {
        $group: {
          _id: '$producto',
          cantidad: { $sum: '$cantidad' },
          montoTotal: { $sum: '$importe' },
        },
      },
      {
        $project: {
          _id: 0,
          producto: '$_id',
          cantidad: 1,
          montoTotal: 1,
        },
      },
    ]);

    return venta;
  }

  private async ventaExcelSucursal(ventaDto: VentaExcelDto) {
    const ventaSucursal: any[] = [];
    for (let sucursal of ventaDto.sucursal) {
      const venta = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            fecha: {
              $gte: new Date(ventaDto.fechaInicio),
              $lte: new Date(ventaDto.FechaFin),
            },
            sucursal: new Types.ObjectId(sucursal),
            producto: { $ne: 'DESCUENTO' },
          },
        },
        {
          $group: {
            _id: '$producto',
            cantidad: {
              $sum: {
                $cond: {
                  if: { $ne: ['$producto', 'DESCUENTO'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            montoTotal: {
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

    const data = this.calcularDatosSucursal(ventaSucursal, ventaDto);
    const resultado = {
      data,
      ventaSucursal,
    };
    return resultado;
  }

  private calcularDatosSucursal(
    ventaPorSucursal: any[],
    ventaDto: VentaExcelDto,
  ) {
    const dias = diasHAbiles(ventaDto.fechaInicio, ventaDto.FechaFin);

    const totalVenta: number[] = [];
    const cantidadTotal: number[] = [];
    for (let venta of ventaPorSucursal) {
      const total = venta.data.reduce(
        (total: number, venta: VentaExcelI) => total + venta.montoTotal,
        0,
      );
      const cantidad = venta.data.reduce(
        (total: number, venta: VentaExcelI) => total + venta.cantidad,
        0,
      );
      totalVenta.push(total);
      cantidadTotal.push(cantidad);
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


  private ticketPromedio(totalVenta: number, cantidadTotaVenta: number) {
    const tkPromedio = totalVenta / cantidadTotaVenta;
    return tkPromedio ? parseFloat(tkPromedio.toFixed(2)) : 0;
  }







  public async ventaSucursalExcel(ventaDto: VentaExcelDto) {
    const listaAsesor: AsesorExcelI[] = [];
    for (let sucursal of ventaDto.sucursal) {
      const asesores: AsesorExcelI[] = await this.AsesorExcelSchema.find({
        sucursal: new Types.ObjectId(sucursal),
      });
      listaAsesor.push(...asesores);
    }
    const ventaPorAsesor = await this.ventaPorAsesores(
      listaAsesor,
      ventaDto.fechaInicio,
      ventaDto.FechaFin,
    );
    return ventaPorAsesor;
  }

  private async ventaPorAsesores(
    asesores: AsesorExcelI[],
    fechaInicio: string,
    fechaFin: string,
  ) {
    const venPorAsesor: any[] = [];

    for (let asesor of asesores) {
      const sucursal = await this.sucursalExcelSchema
        .findOne({ _id: asesor.sucursal })
        .select('nombre');
      const asesorNombre = await this.AsesorExcelSchema.findOne({
        _id: asesor.id,
      }).select('usuario');
      const resultado = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            asesor: new Types.ObjectId(asesor.id),
            fecha: {
              $gte: new Date(fechaInicio),
              $lte: new Date(fechaFin),
            },
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
              $sum: {
                $cond: {
                  if: { $ne: ['$producto', 'DESCUENTO'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            totalImporte: {
              $sum: {
                $cond: {
                  if: { $ne: ['$producto', 'DESCUENTO'] },
                  then: '$importe',
                  else: 0,
                },
              },
            },
            totalDescuentos: {
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'DESCUENTO'] },
                  then: '$importe',
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            ventaTotal: 1,
            cantidad: 1,
            totalTicket: 1,
            importeTotalSuma: {
              $subtract: ['$totalImporte', '$totalDescuentos'],
            },

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

  private async extraerSucursal(sucursal: Types.ObjectId) {
    const su = await this.sucursalExcelSchema
      .findOne({ _id: sucursal })
      .select('nombre');
    return su.nombre;
  }

  public async gestionExcel(ventaDto: VentaExcelDto) {
    const dias: number = diasHAbiles(ventaDto.fechaInicio, ventaDto.FechaFin);

    const data = {
      sucursales: 0,
      totalVentas: 0,
      tcPromedio: 0,
      ventaDiariaPorLocal: 0,
      unidadPorTickect: 0,
      ticketPromedio: 0,
      tasaConversion: 0,
    };
    const dataSucursal: any[] = [];

    let filtrador: FiltroVentaI = {
      fecha: {
        $gte: new Date(ventaDto.fechaInicio),
        $lte: new Date(ventaDto.FechaFin),
      },
    };
    if (ventaDto.tipoVenta) {
      filtrador.tipoVenta = new Types.ObjectId(ventaDto.tipoVenta);
    }

    if (ventaDto.estado) {
      if (ventaDto.estado === EstadoEnum.finalizado) {
        filtrador.flagVenta = ventaDto.estado;
      } else if (ventaDto.estado === EstadoEnum.realizadas) {
        filtrador.flagVenta = { $ne: EstadoEnum.finalizado };
      }
    }

    for (let idsucursal of ventaDto.sucursal) {
      const sucursal = await this.sucursalExcelSchema.findOne({
        _id: idsucursal,
      });
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
            totalImporte: {
              $sum: {
                $cond: {
                  if: { $ne: ['$producto', 'DESCUENTO'] },
                  then: '$importe',
                  else: 0,
                },
              },
            },
            totalDescuentos: {
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'DESCUENTO'] },
                  then: '$importe',
                  else: 0,
                },
              },
            },

            cantidad: {
              $sum: {
                $cond: {
                  if: { $ne: ['$producto', 'DESCUENTO'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            ventaTotal: 1,
            totalTicket: 1,
            traficoCliente: 1,
            cantidad: 1,
            importeTotalSuma: {
              $subtract: ['$totalImporte', '$totalDescuentos'],
            },
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
            };

      const data = {
        sucursal: sucursal.nombre,
        id: sucursal._id,
        ...resultadoFinal,
      };

      dataSucursal.push(data);
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
    data.sucursales = ventaDto.sucursal.length;
    data.totalVentas = totalVenta;

    data.unidadPorTickect = parseFloat((cantidad / ticket).toFixed(2))
      ? parseFloat((cantidad / ticket).toFixed(2))
      : 0;
    data.ventaDiariaPorLocal = parseFloat((totalVenta / dias).toFixed(2));

    data.ticketPromedio = this.ticketPromedio(totalVenta, cantidad);

    data.tcPromedio = (traficoCliente / ticket) * 100;
    const resultado = {
      ...data,
      dataSucursal,
    };

    return resultado;
  }

  public async sucursalVentaInformacion(
    id: string,
    informacionVentaDto: informacionVentaDto,
  ) {
    let filtrador: FiltroVentaI = {
      fecha: {
        $gte: new Date(informacionVentaDto.fechaInicio),
        $lte: new Date(informacionVentaDto.fechaFin),
      },
    };

    if (informacionVentaDto.estado) {
      if (informacionVentaDto.estado === EstadoEnum.finalizado) {
        filtrador.flagVenta = informacionVentaDto.estado;
      } else if (informacionVentaDto.estado === EstadoEnum.realizadas) {
        filtrador.flagVenta = { $ne: EstadoEnum.finalizado };
      }
    }

    if (informacionVentaDto.tipoVenta) {
      filtrador.tipoVenta = new Types.ObjectId(informacionVentaDto.tipoVenta);
    }

    const ventaSucursal = await this.VentaExcelSchema.aggregate([
      {
        $match: {
          sucursal: new Types.ObjectId(id),
          ...filtrador,
          producto: { $ne: 'DESCUENTO' },
        },
      },
      {
        $group: {
          _id: '$producto',
          cantidad: {
            $sum: {
              $cond: {
                if: { $ne: ['$producto', 'DESCUENTO'] },
                then: '$cantidad',
                else: 0,
              },
            },
          },
          totalImporte: {
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
          _id: 1,
          cantidad: 1,
          totalImporte: 1,
        },
      },
    ]);
    return ventaSucursal;
  }


  public async informacionLente(id:string ,  informacionVentaDto: informacionVentaDto){
   const tratamiento= await this.lenteTratamiento(id, informacionVentaDto)
   const tipoLente = await this.tipoDeLente(id,informacionVentaDto )   
    return{
      tratamiento,
      tipoLente
    }
     
  }


  private async lenteTratamiento(id:string ,  informacionVentaDto: informacionVentaDto){

    const lente = await this.VentaExcelSchema.aggregate([
      {
        $match:{
           producto:productos.lente,
           sucursal:new Types.ObjectId(id),
           fecha: {
            $gte: new Date(informacionVentaDto.fechaInicio),
            $lte: new Date(informacionVentaDto.fechaFin),
          },

        }
      },
      {
        $lookup:{
          from:'tratamientos',
          foreignField:'_id',
          localField:'tratamiento',
          as:'tratamiento'
        }
      },
      {
        $unwind:'$tratamiento'
      },
      {
        $group:{
          _id:'$tratamiento._id',
          tratamiendo:{$first:'$tratamiento.nombre'},
          cantidad: { $sum: 1},
           importe:{$sum:'$importe'}
        }
      },
      {
        $project:{
           tratamiendo:1,
           cantidad:1,
           importe:1
        }
      }
    ])    
    return lente
  }


  private async tipoDeLente(id:string ,  informacionVentaDto: informacionVentaDto){
    const lente = await this.VentaExcelSchema.aggregate(
     [ {
        $match:{
           producto:productos.lente,
           sucursal:new Types.ObjectId(id),
           fecha: {
            $gte: new Date(informacionVentaDto.fechaInicio),
            $lte: new Date(informacionVentaDto.fechaFin),
          },

        }
      }
      ,
      {
        $lookup:{
          from:'tipolentes',
          foreignField:'_id',
          localField:'tipoLente',
          as:'tipoLente'
        }
       },{
        $unwind :'$tipoLente'
       },

       {
        $group:{
          _id:'$tipoLente._id',
          tipoLente:{$first:'$tipoLente.nombre'},
          cantidad:{$sum:1},
          importe :{$sum:'$importe'}
        }
       },{
        $project:{
          tipoLente:1,
          cantidad:1,
          importe:1,
        }
       }
      
      ])
  return lente
    
  }


  public async indicadoresPorFecha(ventaDto: VentaExcelDto){
    const data:any[]=[]
    for (let su of ventaDto.sucursal){
      const sucursal = await this.sucursalService.listarSucursalId(su)      
      const venta = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            sucursal:new Types.ObjectId(su),
            fecha: {
              $gte: new Date(ventaDto.fechaInicio),
              $lte: new Date(ventaDto.FechaFin),
            },

          }
        },
        {
          $group:{
              _id:{
                aqo:{$year:'$fecha'},
                mes:{$month:'$fecha'},
                dia:{$dayOfMonth:'$fecha'}
              },
              fecha:{$first:'$fecha'},
              tickets:{
                  $sum:{
                    $cond:{ 
                      if : {$eq: ['$aperturaTicket','1'] },
                      then: 1,
                      else:0
                    }
                  }
              },
              cantidad :{
                $sum:{
                  $cond:{
                    if :{ $ne :['$producto', 'DESCUENTO'] },
                    then:'$cantidad',
                    else:0
                  }
                }
              },
              importe:{
                $sum:{
                  $cond:{
                    if :{ $ne :['$producto', 'DESCUENTO'] },
                    then:'$importe',
                    else:0
                  }
                }
              },
              ventaTotal:{
                $sum:{
                  $cond:{
                    if :{ $eq :['$aperturaTicket', '1'] },
                    then:'$montoTotal',
                    else:0
                  }
                },
              },

              totalDescuentos:{
                $sum:{
                  $cond:{
                    if :{ $eq :['$producto', 'DESCUENTO'] },
                    then:'$importe',
                    else:0
                  }
                }
              }


          },
         
          
        },
        {
          $project:{
            _id:1,
            fecha:1,
            tickets:1,
            ventaTotal:1,
            cantidad:1,
            totalImporte:{
              $subtract: [
                "$importe",
                '$totalDescuentos'
            ]
            },
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

            tasaConversion:{
              $sum:0
            }
            

          }
        }
      ])
        const resultado={
          sucursal:sucursal.nombre,
          id:sucursal._id,
          venta
        }
        data.push(resultado)
        
    }
          return data
  }

 
}
