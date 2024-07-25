import { Inject, Injectable, Type  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DetalleVenta, Venta } from './schemas/venta.schema';
import { Model, Types} from 'mongoose';

import { VentaDto } from './dto/venta.dto';

import { SucursalService } from 'src/sucursal/sucursal.service';

import { VentaPorProductoI} from './interfaces/venta.interface';

import { tipoProductoI } from 'src/productos/enums/productos.enum';


import { respuestaI } from './interfaces/respuesta.interface';
import { CACHE_MANAGER,Cache } from '@nestjs/cache-manager';
import { count } from 'console';
import { LenteI } from './interfaces/lente.interface';
import { Producto } from 'src/productos/schema/producto.schema';

@Injectable()
export class VentaService {

  constructor(
   @Inject(CACHE_MANAGER) private cacheMagager:Cache,
    private readonly SucursalService:SucursalService,
    @InjectModel(DetalleVenta.name) private readonly DetalleVentaSchema:Model<DetalleVenta>,
    @InjectModel(Venta.name) private readonly VentaSchema:Model<Venta>
   
){}

  async findAll(ventaDto:VentaDto) { 


    //  const dataChache= await this.cacheMagager.get('data')
      //if(dataChache){        
       // return dataChache
      //}

      const dataVenta= await this.ventaPorProductos([tipoProductoI.MONTURA,tipoProductoI.LENTE_DE_CONTACTO,tipoProductoI.GAFA ],ventaDto.fechaInicio, ventaDto.FechaFin,ventaDto)
      const dataPorSucursal= await this.ventaPorProductoSucursal([tipoProductoI.MONTURA,tipoProductoI.LENTE_DE_CONTACTO,tipoProductoI.GAFA ],ventaDto.fechaInicio, ventaDto.FechaFin, ventaDto)

      const ventaTotal= this.ventaTotal(dataVenta)
      const ventaPorSucursal=this.ventaTotal(dataPorSucursal)
      const respuesta={
          data:{
            fecha:{inicio:ventaDto.fechaInicio, fin:ventaDto.FechaFin},
            ventaTotal,
            dataVenta
          },
          dataSucursal:{
            fecha:{inicio:ventaDto.fechaInicio, fin:ventaDto.FechaFin},
            ventaPorSucursal,
            cantidadSucursales:ventaDto.sucursal.length,
           dataPorSucursal
          }
      }
  
     // await this.cacheMagager.set('data', respuesta, 1000* 30)
    
      return  respuesta;
  }






 private ticketPromedio(totalVenta:number, cantidadTotaVenta:number){
  const tkPromedio= totalVenta/ cantidadTotaVenta
  return tkPromedio ? tkPromedio: 0
 }
 private ventaTotal(venta:respuestaI[]){  
    const total:number= venta.reduce((total, venta)=>total + venta.total,0) 
    return  total
 }
 private async  ventaPorProductos(tipo:tipoProductoI[], fechaInicio:string, FechaFin:string, ventaDto:VentaDto){
    const ventaProducto:any[]=[]
    for( let tipoProducto of tipo){
      const producto:VentaPorProductoI[]= await this.DetalleVentaSchema.aggregate([
        {
          $lookup:{
            from:'Producto',
            localField:'producto',
            foreignField:'_id',
            as :'productoInfo'
          }
        },
        {
          $match:{'productoInfo.tipoProducto':tipoProducto}
     
        },
        {
         $match:{
           fechains:{$gte: new Date(fechaInicio),  $lte: new Date(FechaFin)}
         }
        },
        {
          $lookup: {
              from: 'Venta',
              localField: 'venta',
              foreignField: '_id',
              as: 'ventaInfo'
          }
      },
      {
          $match: { 
           'ventaInfo.flag': ventaDto.flag,
           'ventaInfo.tipoVenta':new Types.ObjectId(ventaDto.tipoVenta[0])
         }
      },
        {
          $project: {
              _id: 1,
              producto: {
                  nombre: '$productoInfo.tipoProducto', 
                  venta:'$ventaInfo._id',
                  sucursal:'$ventaInfo.sucursal',
                  preciototal: '$preciototal', 
                  cantidad: '$cantidad',
                  
              }
          }
      },
     
        ])
        const productoNombre= producto.map((item) => item.producto.nombre)
        const total= producto.reduce((total, item) => total + item.producto.preciototal, 0)
        const cantidad= producto.reduce((total, item) => (total + item.producto.cantidad), 0)   
         const ticketPromedio= this.ticketPromedio(total, cantidad)
        
        const resultado:respuestaI={
         producto:productoNombre[0] ?productoNombre[0] : tipoProducto ,
         cantidad:cantidad,
         total:total,
         ticketPromedio 
      
        }
        ventaProducto.push(resultado)
       
    }

    const lente= await this.lentes(fechaInicio, FechaFin, ventaDto)
    ventaProducto.push(lente)
    return ventaProducto
}

 

async ventaPorProductoSucursal(tipo:tipoProductoI[], fechaInicio:string, FechaFin:string, ventaDto:VentaDto){  
  const resultadoData:any[]=[]
  for(let tipoProducto of tipo){
    for (let suscursal of ventaDto.sucursal){
      const suscursalProdcuto = await this.SucursalService.buscarScursal(new Types.ObjectId(suscursal))  
      const producto:VentaPorProductoI[]= await this.DetalleVentaSchema.aggregate([
        {
          $lookup:{
            from:'Producto',
            localField:'producto',
            foreignField:'_id',
            as :'productoInfo'
          }
        },
        {
          $match:{'productoInfo.tipoProducto':tipoProducto}
     
        },
        {
         $match:{
           fechains:{$gte: new Date(fechaInicio),  $lte: new Date(FechaFin)}
         },
         
        },
        {
         $lookup: {
             from: 'Venta',
             localField: 'venta',
             foreignField: '_id',
             as: 'ventaInfo'
         }
     },
     {
         $match: {
          'ventaInfo.sucursal': new Types.ObjectId(suscursal),

          'ventaInfo.flag':ventaDto.flag,
          'ventaInfo.tipoVenta':new Types.ObjectId(ventaDto.tipoVenta[0])
        }
     },
        {
          $project: {
              _id: 1,
              producto: {
                  nombre: '$productoInfo.tipoProducto', 
                  venta:'$ventaInfo._id',
                  sucursal:'$ventaInfo.sucursal',
                  preciototal: '$preciototal', 
                  cantidad: '$cantidad',
                  
              }
          }
      },
     
        ])        
        const productoNombre= producto.map((item) => item.producto.nombre)
        const total= producto.reduce((total, item) => total + item.producto.preciototal, 0)
        const cantidad= producto.reduce((total, item) => (total + item.producto.cantidad), 0)   
         const ticketPromedio= this.ticketPromedio(total, cantidad)    
        const resultado={
          suscursal:suscursalProdcuto,
         producto: productoNombre[0] ?productoNombre[0] : tipoProducto ,
         cantidad:cantidad,
         total:total,
         ticketPromedio 
      
        }
        
        
        resultadoData.push(resultado)
      
    }
   
    
  }  
  const lente =await this.lentesPorSucursal(fechaInicio, FechaFin, ventaDto.sucursal, ventaDto)
  resultadoData.push(...lente)
  return resultadoData
}


 private async  lentes(fechaInicio:string, FechaFin:string, ventaDto:VentaDto){  
      const lente:LenteI[] =await this.VentaSchema.aggregate([
        {
          $match:{$or:[{lente1 :{ $exists: true }},{lente2 :{ $exists: true }} ]}
        },
        {
          $match:{fecha:{$gte: new Date(fechaInicio),  $lte: new Date(FechaFin)}, flag:ventaDto.flag}
        },
        {$project:{
          _id:1,
          precioTotal:1,
        }},
       
      ])

      const total = lente.reduce((total, lente)=>total+ lente.precioTotal,0)
      const tkPromedio= this.ticketPromedio(total, lente.length) 
      const resultado:respuestaI={
        producto:'Lente',
        total:total,
        cantidad:lente.length,
        ticketPromedio:tkPromedio
      }
      
      
     return resultado
  }
  
  private async  lentesPorSucursal(fechaInicio:string, FechaFin:string, sucursal:string[], ventaDto:VentaDto){  
    const resultadoData:any[]=[]    
    console.log(fechaInicio, FechaFin);
    
    for (let sucur of sucursal){

      const suscursalProdcuto = await this.SucursalService.buscarScursal(new Types.ObjectId(sucur))  
      const lente:LenteI[] =await this.VentaSchema.aggregate([
        {
          $match:{$or:[{lente1 :{ $exists: true }},{lente2 :{ $exists: true }}],
          fecha:{$gte: new Date(fechaInicio),  $lte: new Date(FechaFin)},
          tipoVenta:new Types.ObjectId(ventaDto.tipoVenta[0])
          }
        },
    
        {$project:{
          _id:1,
          precioTotal:1,
        }},
       
      ])
      console.log(lente);
      
      const total = lente.reduce((total, lente)=>total+ lente.precioTotal,0)
      const tkPromedio= this.ticketPromedio(total, lente.length) 
      const resultado:respuestaI={
        sucursal:suscursalProdcuto,
        producto:'Lente',
        total:total,
        cantidad:lente.length,
        ticketPromedio:tkPromedio
      }

      resultadoData.push(resultado)


    }
    
    
   return resultadoData
}


}






