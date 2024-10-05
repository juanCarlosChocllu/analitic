import {
  forwardRef,
  HttpStatus,
  Inject,
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


import { flag } from './enums/flag.enum';


import { FiltroVentaI } from './interfaces/filtro.venta.interface';

import { EstadoEnum } from './enums/estado.enum';
import { productos } from './enums/productos.enum';

import { SuscursalExcel } from 'src/sucursal/schema/sucursal.schema';
import { KpiDto } from './dto/kpi.venta.dto';
import { AbonoService } from 'src/abono/abono.service';
import { log } from 'node:console';
import { EmpresaService } from 'src/empresa/empresa.service';

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

    private readonly sucursalService: SucursalService,
    private readonly empresaService: EmpresaService,

    @Inject(forwardRef(() =>AbonoService))
    private readonly abonoService: AbonoService,
  ) {}
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
        const abono = await this.abonoService.buscarAbonoPorNumeroTicket(data.numeroTicket)
        const total = abono.reduce((total, a) => total + a.monto, 0);
        
        if (total >= data.montoTotal ) {
          await this.VentaExcelSchema.updateMany(
            { numeroTicket: data.numeroTicket },
            { $set: { flagVenta: flag.FINALIZADO } },
          );
        }
      }
    }
    return { status: HttpStatus.OK };
  }



   async verificarVentaExistente(numeroTicket:string){
    const venta = await this.VentaExcelSchema.findOne({
      numeroTicket: numeroTicket,
      flagVenta: { $ne: flag.FINALIZADO },
    });  
    return venta
   }


  async ventaExel(ventaDto: VentaExcelDto) {
 
    const [venta, ventaSucursal]= await Promise.all([
        this.ventaExcel(ventaDto),
     this.ventaExcelSucursal(ventaDto)
        ])
    const total = venta.reduce((total, ve) => total + ve.importe, 0);
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

    const filtrador:FiltroVentaI={ fecha: {
      $gte: new Date(ventaDto.fechaInicio),
      $lte: new Date(ventaDto.FechaFin),
    },
    empresa: new Types.ObjectId(ventaDto.empresa),
  }

    if(ventaDto.tipoVenta){
      filtrador.tipoVenta=new Types.ObjectId(ventaDto.tipoVenta)
    }
    
   const venta = await this.VentaExcelSchema.aggregate([
      {
        $match: filtrador
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
          montoTotal:1,
          descuento:1,
          ventas:1
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
            tipoVenta:new Types.ObjectId(ventaDto.tipoVenta),
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

  private async ventaPorAsesores( asesores: AsesorExcelI[], fechaInicio: string, fechaFin: string) {
    const venPorAsesor: any[] = [];

    for (let asesor of asesores) {
      const sucursal = await this.sucursalExcelSchema.findOne({ _id: asesor.sucursal }).select('nombre');
      const asesorNombre = await this.AsesorExcelSchema.findOne({ _id: asesor.id,}).select('usuario');
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

    data.tcPromedio = (traficoCliente / ticket) * 100 ? (traficoCliente / ticket) * 100  : 0;
    const resultado = {
      ...data,
      dataSucursal,
    };
    console.log(data);
    
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

private async verificacionEmpresa(kpiDto:KpiDto){
  const empresa = await this.empresaService.buscarEmpresa(kpiDto.empresa)
  if(empresa.nombre === 'OPTICENTRO'){
    return this.kpiOpticentro(kpiDto)
  }
  else if(empresa.nombre=== 'ECONOVISION'){
    return this.kpiOpEconovision(kpiDto)
  }else if(empresa.nombre=== 'TU OPTICA'){
    return this.kpiTuOptica(kpiDto)

  }
  
  else{
    return {mensaje:'Esta cadena no tiene kpi'}
  }
  
}



  public async kpi(kpiDto: KpiDto) {
    return this.verificacionEmpresa(kpiDto)
   
  }

//'-----------------------capi econovision--------------------
  
  private async kpiOpEconovision(kpiDto: KpiDto){
    const data:any[]=[]
    let filtrador:FiltroVentaI={
      fecha: {
        $gte: new Date(kpiDto.fechaInicio),
        $lte: new Date(kpiDto.FechaFin),
        
      },
    }
   
    for (let  su of kpiDto.sucursal ){
      const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))      
      filtrador.sucursal= new Types.ObjectId(su)  
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            ...filtrador,
            producto:productos.lente
          }
        },
        {
          $lookup:{
            from:'tratamientos',
            foreignField:'_id',
            localField:'tratamiento',
            as:'tratamiento',
            
          }
        },

        {
          $lookup:{
            from:'marcalentes',
            foreignField:'_id',
            localField:'marcaLente',
            as:'marcaLente'
          }
        },
        {
          $lookup:{
            from:'tipocolors',
            foreignField:'_id',
            localField:'tipoColor',
            as:'tipoColor'
          }
        },
        {
          $lookup:{
            from:'materials',
            foreignField:'_id',
            localField:'material',
            as:'material'
          }
        },
        {
          $unwind:{ path: '$tratamiento', preserveNullAndEmptyArrays: true }
        },

        {
          $unwind:{ path: '$marcaLente', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind:{ path: '$tipoColor', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind:{ path: '$material', preserveNullAndEmptyArrays: true }
        },
        {
          $group:{
            _id:null,
            lentes:{
              $sum:{
                $cond:{
                  if:{$eq:['$producto','LENTE']},
                  then:'$cantidad',
                  else:0
                }
              }
            },
            antireflejo:{
              $sum:{
                $cond:{
                  if:{ $or:[
                    {$eq:['$tratamiento.nombre','BLUE SHIELD']},
                    {$eq:['$tratamiento.nombre','GREEN SHIELD']},
                 
                  ]},
                  then:1,
                  else:0
                }
              }
            },
            progresivos:{
              $sum:{
                $cond:{
                  if:{$or:[
                    {$eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']},
                    {$eq:['$marcaLente.nombre','DISEÑO DIGITAL']},
                    {$eq:['$marcaLente.nombre','DIGITAL PLATINIUM']},
                    {$eq:['$marcaLente.nombre','DIGITAL GOLD']},
                    //{$eq:['$marcaLente.nombre','Digital Ruby']}, no se encontro en la base de datos
                  ]},
                  then:1,
                  else:0
                }
              }
            
            },
            ocupacional:{
              $sum:{
                $cond:{
                  if:{$eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']},
                  then:1,
                  else:0
                }
              }
            
            },

            fotosensibles: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ["$tipoColor.nombre", "SOLAR ACTIVE"] },
                      { $eq: ["$tipoColor.nombre", "VIOLETA"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "NARANJA"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "AZUL"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "ROSADO"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "VERDE HI INDEX"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "DRIVE"] },  //NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "GRIS"] },   //NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "CAFE"] },   //NO SE ENCONTRO EN LA DB
                    ]
                  },
                  then: "$cantidad",
                  else: 0
                }
              }
            },

            participacionMaterial:{
              $sum:{
                $cond:{
                  if:{$or:[
                    {$eq:['$material.nombre','ORGANICO']},
                    {$eq:['$material.nombre','POLICARBONATO']},
                    {$eq:['$material.nombre','HIGH INDEX']},
                    {$eq:['$material.nombre','HIGH INDEX']},//dudoso
                    {$eq:['$material.nombre','HIGH LIGTH']},//no existe en la base de datos
                    {$eq:['$material.nombre','MINERAL']},
                    {$eq:['$material.nombre','SUPER THIN AND LITE']},
                  ]},
                  then:'$cantidad',
                  else:0
                }
              }
            }
          

         
          }
        },

        {
          $project:{
            lentes:1,
            antireflejo:1,
            porcentajeAntireflejo: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$antireflejo', '$lentes'] },
                    100
                  ]
                },
                2
              ]
            
            },
            progresivos:1,
            ocupacional:1,
            progresivosOcupacionales: { $add: ['$progresivos', '$ocupacional'] },
            progresivosOcupacionalesPorcentaje: {
              $round: [
                {
                  $multiply: [
                    { $divide: [{ $add: ['$progresivos', '$ocupacional'] }, '$lentes'] },
                    100
                  ]
                },
                2
              ]
            },
            porcentajeProgresivos: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$progresivos','$lentes'] },
                    100
                  ]
                },
                2
              ]
            
            },
            porcentajeOcupacionales: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$ocupacional','$lentes'] },
                    100
                  ]
                },
                2
              ]
            
            },
            fotosensibles:1,
            procentajeFotosensibles:{
              $round:[
                {
                  $multiply:[
                    { $divide: ['$fotosensibles','$lentes'] },
                    100

                  ]
                }
                ,2
              ]
            },
            participacionMaterial:1,
            porcentajeParticipacionMaterial:{
              $round:[
                {
                  $multiply:[
                    { $divide: ['$participacionMaterial','$lentes'] },
                    100

                  ]
                }
                ,2
              ]

            }
            
              
          }
        }
    
      ])
       const resultado ={
        
         sucursal:sucursal.nombre,
         id:sucursal._id,
         dataKpi
       }
       data.push(resultado)
    }
    
    return data


  }

  
  async kpiLentesDeContactoEconoVision(kpiDto: KpiDto){
    console.log('eco');
    const data:any[]=[]
    let filtrador:FiltroVentaI={
      fecha: {
        $gte: new Date(kpiDto.fechaInicio),
        $lte: new Date(kpiDto.FechaFin),
        
      },
    }

    for(let su of kpiDto.sucursal){
      const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))      
      filtrador.sucursal= new Types.ObjectId(su)  
      console.log(filtrador);
      
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            ...filtrador,
            producto:productos.lenteDeContacto
          }
        },
        {
          $lookup:{
            from:'marcas',
            foreignField:'_id',
            localField:'marca',
            as:'marca'
          }
        },
        {
          $lookup:{
            from:'tipoventas',
            foreignField:'_id',
            localField:'tipoVenta',
            as:'tipoVenta'
          }
        },
     

        {
          $unwind:{ path: '$marca', preserveNullAndEmptyArrays:true}
        },
        {
          $unwind:{ path: '$tipoVenta', preserveNullAndEmptyArrays:true}
        },
        {
          $group:{
            _id:null,

            lentesDeContacto:{
              $sum:'$cantidad'

          },

          cantidadDeLentesDeContacto:{
            $sum:{
              $cond:{
                if:{
               $and:[
                {
                  $or:[
                    {$eq:['$marca.nombre','FRESHLOOK']},
                    {$eq:['$marca.nombre','IMPRESIONS']}, //no se encontro en la base de datos 
                      {$eq:['$marca.nombre','BIOMEDICS']}, //no se encontro en la base de datos 
                    {$eq:['$marca.nombre','CLARITY']}, //no se encontro en la base de datos    
                    {$eq:['$marca.nombre','AVAIRA']},
                    {$eq:['$marca.nombre','BIOFINITY']},
                    {$eq:['$marca.nombre','BIOFINITY XR']},//no se encontro en la base de datos 
                    {$eq:['$marca.nombre','BIOFINITY TORIC']},
                    {$eq:['$marca.nombre','BIOFINITY XR TORIC']},//no se encontro en la base de datos 
                  ]
                },
                {$or:[
                  {
                    $eq:['$tipoVenta.abreviatura','VEF']
                  },
                  {
                    $ne:['$tipoVenta.abreviatura','REP']
                  },
                  {
                    $ne:['$tipoVenta.abreviatura','CO']
                  },
                  {
                    $ne:['$tipoVenta.abreviatura','PROD']
                  },
                  {
                    $ne:['$tipoVenta.abreviatura','DA']
                  }
                ]
                }
                
               ]              
              },
                then:'$cantidad',
                else:0
              }
            }
          }

         

          
        }
      },{
        $project:{
          lentesDeContacto:1,
          cantidadDeLentesDeContacto:1,
          porcentajeLentesDeContacto: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$cantidadDeLentesDeContacto', '$lentesDeContacto'] },
                  100
                ]
              },
              2
            ]
          
          },
          
        }
      }
       

      ])

      const resultado={
         sucursal:sucursal.nombre,
         id:sucursal._id,
         dataKpi
      }

      data.push(resultado)
    }
 

    return data
  }





















//------------------------------

  private async kpiOpticentro(kpiDto: KpiDto){
    let filtrador:FiltroVentaI={
      fecha: {
        $gte: new Date(kpiDto.fechaInicio),
        $lte: new Date(kpiDto.FechaFin),
        
      },
    }
    //kpiDto.tipoVenta  ? filtrador['tipoVenta']=new Types.ObjectId( kpiDto.tipoVenta): filtrador
     
    const data:any[]=[]
    for (let su of kpiDto.sucursal) {
      filtrador.sucursal = new Types.ObjectId(su)  
      const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            ...filtrador,
            producto:productos.lente
          },
     
        },
       {
            $lookup:{
              from:'tratamientos',
              foreignField:'_id',
              localField:'tratamiento',
              as:'tratamiento',
              
            }
          },
          {
            $lookup:{
              from:'marcalentes',
              foreignField:'_id',
              localField:'marcaLente',
              as:'marcaLente'
            }
          },
      

          {
            $lookup:{
              from:'tipoventas',
              foreignField:'_id',
              localField:'tipoVenta',
              as:'tipoVenta'
            }
          },

          {
            $lookup:{
              from:'materials',
              foreignField:'_id',
              localField:'material',
              as:'material'
            }
          },


         {
            $unwind:{ path: '$tratamiento', preserveNullAndEmptyArrays: true }
          },
          {
            $unwind:{ path: '$marcaLente', preserveNullAndEmptyArrays: true }
          },
          {
            $unwind:{ path: '$tipoVenta', preserveNullAndEmptyArrays: true }
          },
          
          {
            $unwind:{ path: '$material', preserveNullAndEmptyArrays: true }
          },

          {
            $group:{
              _id:null,

              lentes:{
                $sum:{
                  $cond:{
                    if:{$eq:['$producto','LENTE']},
                    then:'$cantidad',
                    else:0
                  }
                }
              },

              materialUnitario:{
                $sum:{
                  $cond:{
                    if:{$and:[
                        {$eq:['$producto','LENTE']},
                        {$or:[
                          {$eq:['$material.nombre','ORGANICO']},
                          {$eq:['$material.nombre','POLICARBONATO']},
                          {$eq:['$material.nombre','THIN AND LITE']},
                          {$eq:['$material.nombre','HI LITE RESINA']},
                          {$eq:['$material.nombre','SUPER THIN AND LITE']}, //dudoso 
                          {$eq:['$material.nombre','SUPER HI LITE RESINA - 1.74']}, //dudoso 
                        ]}
                    ]  },
                    then:1,
                    else:0
                  }
                }
              },
              antireflejo:{
                $sum:{
                  $cond:{
                    if:{ $or:[
                      {$eq:['$tratamiento.nombre','CLARITY']},
                      {$eq:['$tratamiento.nombre','CLARITY PLUS']},
                      {$eq:['$tratamiento.nombre','BLUCLARITY']},
                      {$eq:['$tratamiento.nombre','STOP AGE']},
                     // {$eq:['$tratamiento.nombre','ANTIREFLEJO']}
                    ]},
                    then:1,
                    else:0
                  }
                }
              },
             
              progresivos:{
                $sum:{
                  $cond:{
                    if:{$or:[
                      {$eq:['$marcaLente.nombre','TALLADO TRADICIONAL']},

                      {$eq:['$marcaLente.nombre','DISEÑO DIGITAL']},

                      {$eq:['$marcaLente.nombre','DIGITAL HP OPTIMIZADO']},

                      {$eq:['$marcaLente.nombre','DIGITAL HP MUNDO TACTIL']},//dudoso

                      //digital driver
                      //gtz byte zesse
                      {$eq:['$marcaLente.nombre','DIGITAL PRIMER USUARIO']},
                      {$eq:['$marcaLente.nombre','DIGITAL SENIOR']},
                      {$eq:['$marcaLente.nombre','AILENS']},
                    ]},
                    then:1,
                    else:0
                  }
                }
              
              },
              ocupacional:{
                $sum:{
                  $cond:{
                    if:{$eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']},
                    then:1,
                    else:0
                  }
                }
              
              },
            }
          },
         {
            $project: {            
             lentes: 1,
              progresivos: 1,
              ocupacional: 1,
              materialUnitario:1,
              ocupacionalProgresivos: 1,
              antireflejo: 1,
              progresivosOcupacionales: { $add: ['$progresivos', '$ocupacional'] },
              progresivosOcupacionalesPorcentaje: {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $add: ['$progresivos', '$ocupacional'] }, '$lentes'] },
                      100
                    ]
                  },
                  2
                ]
              },
              porcentajeAntireflejo: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$antireflejo', '$lentes'] },
                      100
                    ]
                  },
                  2
                ]
              
              },
              porcentajeProgresivos: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$progresivos','$lentes'] },
                      100
                    ]
                  },
                  2
                ]
              
              },
              porcentajeOcupacionales: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$ocupacional','$lentes'] },
                      100
                    ]
                  },
                  2
                ]
              
              },

           
              porcentajeMaterialUnitario: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$materialUnitario', '$lentes'] },
                      100
                    ]
                  },
                  2
                ]
              
              },
            }
          }
        
      ]);   

      const resultado={
        sucursal:sucursal.nombre,
        id:sucursal._id,
        dataKpi

      }

      data.push(resultado)
    }
  
    return data
  }



  async kpiLentesDeContactoOpticentro(kpiDto:KpiDto){
    console.log('opticentro');
    
    const data:any[]=[]

    let filtrador:FiltroVentaI={
      fecha: {
        $gte: new Date(kpiDto.fechaInicio),
        $lte: new Date(kpiDto.FechaFin),
        
      },
    }

    for(let su of kpiDto.sucursal){
      filtrador.sucursal = new Types.ObjectId(su)
      const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            ...filtrador,
            producto:productos.lenteDeContacto
          }
        },
        {
          $lookup:{
            from:'marcas',
            foreignField:'_id',
            localField:'marca',
            as:'marca'
          }
        },
        {
          $unwind:{path:'$marca', preserveNullAndEmptyArrays:true}
        }
        ,

        {
      
          $group:{
            _id:null,
            lentesDeContacto:{
              $sum:'$cantidad'
            },
            cantidadDeLentesDeContacto: {
              $sum: {
                $cond: {
                  if: { $and:[
                    {
                      $or:[
                      {$eq: ['$marca.nombre','BIOFINITY']},
                      {$eq: ['$marca.nombre','AVAIRA']},
                      {$eq: ['$marca.nombre','BIOMEDICS']}
                      //BIOMEDICS NO HAY LA MARCA
                    ],
                  },
                  {
                    $or:[
                      {
                        $ne:['$tipoVenta.abreviatura','VEF']
                      },
                      {
                        $ne:['$tipoVenta.abreviatura','REP']
                      },
                      {
                        $ne:['$tipoVenta.abreviatura','CO']
                      },
                      {
                        $ne:['$tipoVenta.abreviatura','PROD']
                      },
                      {
                        $ne:['$tipoVenta.abreviatura','DA']
                      },
                    ]
                  }
                  ]   },
                  then: '$cantidad',
                  else: 0
                }
              }
            },



          }
        },
        {
          $project:{
            lentesDeContacto:1,
            cantidadDeLentesDeContacto: 1,
            porcentajeLentesDeContacto: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$cantidadDeLentesDeContacto', '$lentesDeContacto'] },
                    100
                  ]
                },
                2
              ]
            
            },
          }
        }
      ])
      const resultado ={
        sucursal:sucursal.nombre,
        id:sucursal.id,
        dataKpi
      }
      data.push(resultado)

    }
    return data

  }





  async kpiMonturasVip(kpiDto:KpiDto){
    let filtrador:FiltroVentaI={
      fecha: {
        $gte: new Date(kpiDto.fechaInicio),
        $lte: new Date(kpiDto.FechaFin),
        
      },
    }

    const dataMonturasVip:any=[]
    for(let su of  kpiDto.sucursal){
      filtrador.sucursal = new Types.ObjectId(su)  
      const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))
       const kpiMonturasVip = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            ...filtrador,
            producto:productos.montura

          },
        },
        {
          $lookup:{
            from:'marcas',
            foreignField:'_id',
            localField:'marca',
            as:'marca'
          }
        }
        ,
       
        
        {
          $group:{
            _id:null,
            monturas:{
              $sum:{
                $sum:'$cantidad'
            },
          },

            monturasVip: {
              $sum: {
                $cond: {//preguntar si si estas marcas hay la posivilad de que su precio fuera menor que 700
                  if: {$and:[
                    {$gte: ['$importe', 700] },
                    {$or:['$marca.nombre','BENETTON']},
                    {$or:['$marca.nombre','BENETTON KIDS']},
                    {$or:['$marca.nombre','CAROLINA HERRERA']},
                    {$or:['$marca.nombre','CARRERA']},
                    {$or:['$marca.nombre','CHRISTIAN LACROIX']}
                  ]},
                  then: '$cantidad',
                  else: 0
                }
              }
            }

          },
         
          
        },
        {
          $project:{
            monturas:1,
            monturasVip:1,
            porcentajeMonturasVip: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$monturasVip', '$monturas'] },
                    100
                  ]
                },
                2
              ]
            
            },
          }
        }

       ])

        const resultado={
          sucursal: sucursal.nombre,
          kpiMonturasVip
        }
       dataMonturasVip.push(resultado)
       

    }

    return dataMonturasVip

  }


  //---------------------------------------------------------
  
  //----------kpi tu optica

   private async kpiTuOptica(kpiDto:KpiDto){
    

    const data:any[]= []
    let filtrador:FiltroVentaI={
      fecha: {
        $gte: new Date(kpiDto.fechaInicio),
        $lte: new Date(kpiDto.FechaFin),
        
      },
    }

    for(let su of kpiDto.sucursal){
      const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))
      filtrador.sucursal= new Types.ObjectId(su)

      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            ...filtrador,
           producto:productos.lente
          }
        },
        {
          $lookup:{
            from:'tratamientos',
            foreignField:'_id',
            localField:'tratamiento',
            as:'tratamiento',
            
          }
        },

        {
          $lookup:{
            from:'marcalentes',
            foreignField:'_id',
            localField:'marcaLente',
            as:'marcaLente'
          }
        },
        {
          $lookup:{
            from:'tipocolors',
            foreignField:'_id',
            localField:'tipoColor',
            as:'tipoColor'
          }
        },
        {
          $lookup:{
            from:'materials',
            foreignField:'_id',
            localField:'material',
            as:'material'
          }
        },
        {
          $unwind:{ path: '$tratamiento', preserveNullAndEmptyArrays: true }
        },

        {
          $unwind:{ path: '$marcaLente', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind:{ path: '$tipoColor', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind:{ path: '$material', preserveNullAndEmptyArrays: true }
        },
        {
          $group:{
            _id:null,
            lentes:{
              $sum:{
                $cond:{
                  if:{$eq:['$producto','LENTE']},
                  then:'$cantidad',
                  else:0
                }
              }
            },  
            
            antireflejo:{
              $sum:{
                $cond:{
                  if:{ $or:[
                    {$eq:['$tratamiento.nombre','BLUE SHIELD']},
                    {$eq:['$tratamiento.nombre','GREEN SHIELD']},
                 
                  ]},
                  then:'$cantidad',
                  else:0
                }
              }
            },
            progresivos:{
              $sum:{
                $cond:{
                  if:{$or:[
                    {$eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']},
                    {$eq:['$marcaLente.nombre','DISEÑO DIGITAL']},
                    {$eq:['$marcaLente.nombre','DIGITAL PLATINIUM']},
                    {$eq:['$marcaLente.nombre','DIGITAL GOLD']},
                    {$eq:['$marcaLente.nombre','DIGITAL RUBY']},// no se encontro en la base de datos
                  ]},
                  then:1,
                  else:0
                }
              }
            
            },
            ocupacional:{
              $sum:{
                $cond:{
                  if:{$eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']},
                  then:1,
                  else:0
                }
              }
            
            },

            fotosensibles: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ["$tipoColor.nombre", "SOLAR ACTIVE"] },
                      { $eq: ["$tipoColor.nombre", "VIOLETA"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "NARANJA"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "AZUL"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "ROSADO"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "VERDE HI INDEX"] },//NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "DRIVE"] },  //NO SE ENCONTRO EN LA DB
                      { $eq: ["$tipoColor.nombre", "SUPER HI LITE RESINA - 1.74"] },   // DUDOSO
                    
                    ]
                  },
                  then: "$cantidad",
                  else: 0
                }
              }
            },
            participacionMaterial:{
              $sum:{
                $cond:{
                  if:{$or:[
                    {$eq:['$material.nombre','ORGANICO']},
                    {$eq:['$material.nombre','POLICARBONATO']},
                    {$eq:['$material.nombre','HIGH INDEX']},//dudoso
                  
                  ]},
                  then:'$cantidad',
                  else:0
                }
              }
            }
          


          }
        },
        {
          $project:{
            lentes:1,
            antireflejo:1,
            porcentajeAntireflejo: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$antireflejo', '$lentes'] },
                    100
                  ]
                },
                2
              ]
            
            },
            progresivos:1,
            ocupacional:1,
            progresivosOcupacionales: { $add: ['$progresivos', '$ocupacional'] },
            progresivosOcupacionalesPorcentaje: {
              $round: [
                {
                  $multiply: [
                    { $divide: [{ $add: ['$progresivos', '$ocupacional'] }, '$lentes'] },
                    100
                  ]
                },
                2
              ]
            },
            porcentajeProgresivos: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$progresivos','$lentes'] },
                    100
                  ]
                },
                2
              ]
            
            },
            porcentajeOcupacionales: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$ocupacional','$lentes'] },
                    100
                  ]
                },
                2
              ]
            
            },
            fotosensibles:1,
            procentajeFotosensibles:{
              $round:[
                {
                  $multiply:[
                    { $divide: ['$fotosensibles','$lentes'] },
                    100

                  ]
                }
                ,2
              ]
            },
            participacionMaterial:1,
            porcentajeParticipacionMaterial:{
              $round:[
                {
                  $multiply:[
                    { $divide: ['$participacionMaterial','$lentes'] },
                    100

                  ]
                }
                ,2
              ]

            }
            
              
          }
        }
      ])
       const resultado ={
        sucursal:sucursal.nombre,
        id:sucursal._id,
        dataKpi
       }
       data.push(resultado)
      
    }

    return data
   }

   async kpiLentesDeContactoTuOptica(kpiDto: KpiDto){
    console.log('eco');
    const data:any[]=[]
    let filtrador:FiltroVentaI={
      fecha: {
        $gte: new Date(kpiDto.fechaInicio),
        $lte: new Date(kpiDto.FechaFin),
        
      },
    }

    for(let su of kpiDto.sucursal){
      const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))      
      filtrador.sucursal= new Types.ObjectId(su)  
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            ...filtrador,
            producto:productos.lenteDeContacto
          }
        },
        {
          $lookup:{
            from:'marcas',
            foreignField:'_id',
            localField:'marca',
            as:'marca'
          }
        },
        {
          $lookup:{
            from:'tipoventas',
            foreignField:'_id',
            localField:'tipoVenta',
            as:'tipoVenta'
          }
        },
     

        {
          $unwind:{ path: '$marca', preserveNullAndEmptyArrays:true}
        },
        {
          $unwind:{ path: '$tipoVenta', preserveNullAndEmptyArrays:true}
        },
        {
          $group:{
            _id:null,

            lentesDeContacto:{
              $sum:'$cantidad'

          },

          cantidadDeLentesDeContacto:{
            $sum:{
              $cond:{
                if:{
               $and:[
                {
                  $or:[
                    {$eq:['$marca.nombre','FRESHLOOK']},
                    {$eq:['$marca.nombre','IMPRESIONS']}, //no se encontro en la base de datos 
            
                  ]
                },
                {$or:[
                  {
                    $eq:['$tipoVenta.abreviatura','VEF']
                  },
                  {
                    $ne:['$tipoVenta.abreviatura','REP']
                  },
                  {
                    $ne:['$tipoVenta.abreviatura','CO']
                  },
                  {
                    $ne:['$tipoVenta.abreviatura','PROD']
                  },
                  {
                    $ne:['$tipoVenta.abreviatura','DA']
                  }
                ]
                }
                
               ]              
              },
                then:'$cantidad',
                else:0
              }
            }
          }

         

          
        }
      },{
        $project:{
          lentesDeContacto:1,
          cantidadDeLentesDeContacto:1,
          porcentajeLentesDeContacto: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$cantidadDeLentesDeContacto', '$lentesDeContacto'] },
                  100
                ]
              },
              2
            ]
          
          },
          
        }
      }
       

      ])

      const resultado={
         sucursal:sucursal.nombre,
         id:sucursal._id,
         dataKpi
      }

      data.push(resultado)
    }
 

    return data
  }



    //---------------------------------------------------------  

}
