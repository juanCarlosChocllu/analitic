import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  VentaExcel,
} from '../schemas/venta.schema';
import { Model, Types } from 'mongoose';
import {VentaExcelDto } from '../dto/venta.dto';

import { VentaExcelI } from '../core/interfaces/ventaExcel.interface';





import { diasHAbiles } from '../core/util/dias.habiles.util';



import { flag } from '../core/enums/flag.enum';


import { FiltroVentaI } from '../core/interfaces/filtro.venta.interface';



import { SuscursalExcel } from 'src/sucursal/schema/sucursal.schema';

import { AbonoService } from 'src/abono/abono.service';

import { SucursalService } from 'src/sucursal/sucursal.service';

import { sucursalesEnum } from '../core/enums/sucursales.enum';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Injectable()
export class VentaService {
  constructor(
    @InjectModel(VentaExcel.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<VentaExcel>,
    @InjectModel(SuscursalExcel.name, NombreBdConexion.oc)
    private readonly sucursalExcelSchema: Model<SuscursalExcel>,
    private readonly sucursalService:SucursalService,
 
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
  async findOneNumeroTickectVenta(numeroTicket:string){    
    const ticket = await this.VentaExcelSchema.findOne({numeroTicket:numeroTicket})
    return ticket
   }


   async verificarVentaExistente(numeroTicket:string){
    const venta = await this.VentaExcelSchema.findOne({
      numeroTicket: numeroTicket,
      flagVenta: { $ne: flag.FINALIZADO },
    });  
    return venta
   }

   async guardarVentaInformacionRestante(numeroTicket:string, comisiona:Boolean, oftalmologo:Types.ObjectId){
     try {   
      const venta= await this.VentaExcelSchema.updateMany({numeroTicket:numeroTicket},{$set:{comisiona, oftalmologo} })    
      return venta
     } catch (error) {
      console.log(error);
      
      
     }
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
   
    ventaDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: ventaDto.tipoVenta.map((id)=> new Types.ObjectId(id) ) } :filtrador

   const venta = await this.VentaExcelSchema.aggregate([
      {
        $match: {
          ...filtrador,
          producto:{$ne:'DESCUENTO'}
        },
       
      },
      {
        $lookup:{
          from:'suscursalexcels',
          foreignField:'_id',
          localField:'sucursal',
          as:'sucursal'
        }
      },
      {
        $unwind: '$sucursal' 
      },
      {
        $match:{
          'sucursal.nombre': { $ne: 'OPTICENTRO PARAGUAY' }
        }
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
    const filtrador:FiltroVentaI={ fecha: {
      $gte: new Date(ventaDto.fechaInicio),
      $lte: new Date(ventaDto.FechaFin),
    },
   }
    ventaDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: ventaDto.tipoVenta.map((id)=> new Types.ObjectId(id) ) } :filtrador
    
    for (let sucursal of ventaDto.sucursal) {
      filtrador.sucursal=new Types.ObjectId(sucursal)
      const venta = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            ...filtrador,
            producto:{$ne: 'DESCUENTO' }
          }
        },
        {
          $lookup:{
            from:'suscursalexcels',
            foreignField:'_id',
            localField:'sucursal',
            as:'sucursal'
          }
        },
        {
          $unwind: '$sucursal' 
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
      
     if(ventaDto.sucursal.length > 0 && venta.sucursal != sucursalesEnum.opticentroParaguay){
        const total = this.total(venta.data)
        const cantidad = this.cantidadTotal(venta.data)
        totalVenta.push(total);
        cantidadTotal.push(cantidad);
     }else if(ventaDto.sucursal.length == 1 && venta.sucursal == sucursalesEnum.opticentroParaguay){
      const total = this.total(venta.data)
        const cantidad = this.cantidadTotal(venta.data)
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

  
    private cantidadTotal(venta:any[]){
      const cantidad = venta.reduce(
        (total: number, venta: VentaExcelI) => total + venta.cantidad,
        0,
      );
    return cantidad
     }
     private total(venta:any[]){
      const total = venta.reduce(
        (total: number, venta: VentaExcelI) => total + venta.montoTotal,
        0,
      );
      return total
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






  


    
}
