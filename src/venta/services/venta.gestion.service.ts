import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import { VentaDto } from '../dto/venta.dto';

import { FiltroVentaI } from '../core/interfaces/filtro.venta.interface';

import { Sucursal } from 'src/sucursal/schema/sucursal.schema';
import { InformacionVentaDto } from '../dto/informacion.venta.dto';
import { ticketPromedio } from '../core/util/tickectPromedio.util';
import { diasHAbiles } from '../core/util/dias.habiles.util';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { Venta } from '../schemas/venta.schema';
import { AsesoresService } from 'src/asesores/asesores.service';
import { sucursalesEnum } from '../core/enums/sucursales.enum';
import { filtradorDeGestion } from '../core/util/filtrador.gestion.util';
import { AsesorExcelI } from '../core/interfaces/asesor.interface';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Injectable()
export class VentaGestionService {
    constructor(
        @InjectModel(Venta.name, NombreBdConexion.oc)
        private readonly VentaExcelSchema: Model<Venta>,
        @InjectModel(Sucursal.name, NombreBdConexion.oc)
        private readonly sucursalExcelSchema: Model<Sucursal>,
        private readonly sucursalService: SucursalService,
        private readonly asesoresService: AsesoresService,  
      ) {}

    public async indicadoresPorAsesor(ventaDto: VentaDto) {
        const listaAsesor: AsesorExcelI[] = [];
        const filtrador = filtradorDeGestion(ventaDto)
        for (let sucursal of ventaDto.sucursal) {
          const sucur = await this.sucursalService.listarSucursalId(sucursal);
           if(ventaDto.sucursal.length > 0 && sucur.nombre != sucursalesEnum.opticentroParaguay){
            const asesores: AsesorExcelI[] = await this.asesoresService.listarAsesorPorSucursal(sucursal)    
            listaAsesor.push(...asesores);
           }else if(ventaDto.sucursal.length == 1 && sucur.nombre ==sucursalesEnum.opticentroParaguay){
            const asesores: AsesorExcelI[] = await this.asesoresService.listarAsesorPorSucursal(sucursal)    
            listaAsesor.push(...asesores);
           }
        }
        const ventaPorAsesor = await this.ventaPorAsesores(
          listaAsesor,
         filtrador)
        return ventaPorAsesor;
      }
    
    
    
      private async ventaPorAsesores( asesores: AsesorExcelI[], filtrador:FiltroVentaI ) {
        const venPorAsesor: any[] = [];
        for (let asesor of asesores) {
          const sucursal = await this.sucursalExcelSchema.findOne({ _id: asesor.sucursal }).select('nombre');
          

         
            const asesorNombre = await this.asesoresService.asesorFindOne(asesor.id)
            const resultado = await this.VentaExcelSchema.aggregate([
              {
                $match: {
                  asesor: new Types.ObjectId(asesor.id),
                  ...filtrador
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
    
    
      public async indicadoresPorSucursal(ventaDto: VentaDto) {
        const filtrador = filtradorDeGestion(ventaDto)
        const dataSucursal: any[] = [];
        
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
        for (let idsucursal of ventaDto.sucursal) {
          const sucur = await this.sucursalService.listarSucursalId(idsucursal);
          
          if(ventaDto.sucursal.length > 0 && sucur.nombre != sucursalesEnum.opticentroParaguay){
            const indicadorData = await this.idicadorSucursal(idsucursal, filtrador)
            dataSucursal.push(indicadorData)
          }else if (ventaDto.sucursal.length == 1 && sucur.nombre ==sucursalesEnum.opticentroParaguay){
            const indicadorData = await this.idicadorSucursal(idsucursal, filtrador)
            dataSucursal.push(indicadorData)
          }
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
    
        data.ticketPromedio = ticketPromedio(totalVenta, cantidad);
    
        data.tcPromedio = (traficoCliente / ticket) * 100 ? (traficoCliente / ticket) * 100  : 0;
        const resultado = {
          ...data,
          dataSucursal,
        };
        return resultado;
      }
    
      private async idicadorSucursal(idsucursal:Types.ObjectId, filtrador:FiltroVentaI){
        const sucursal = await this.sucursalService.listarSucursalId( idsucursal);
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
                  totalImporte:1,
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
                    totalImporte:0
                  };
      
            const data = {
              sucursal: sucursal.nombre,
              id: sucursal._id,
              ...resultadoFinal,
            };
          return data
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
        if(informacionVentaDto.comisiona != null){
          filtrador.comisiona = informacionVentaDto.comisiona
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
    
    
      public async indicadoresPorFecha(ventaDto: VentaDto){
        const filtrador = filtradorDeGestion(ventaDto)
        const data:any[]=[]
        for (let su of ventaDto.sucursal){
          const sucursal = await this.sucursalService.listarSucursalId(su)      
          const venta = await this.VentaExcelSchema.aggregate([
            {
              $match:{
                sucursal:new Types.ObjectId(su),
                ...filtrador
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
