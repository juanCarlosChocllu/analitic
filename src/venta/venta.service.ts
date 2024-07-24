import { HttpCode, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DetalleVenta, Venta } from './schemas/venta.schema';
import { Model, Types} from 'mongoose';

import { VentaDto } from './dto/venta.dto';

import { SucursalService } from 'src/sucursal/sucursal.service';
import { log } from 'console';
import { verify } from 'crypto';
import { VentaPorProductoI, VentaTotalI } from './interfaces/venta.interface';
import { SucursalInterface } from 'src/sucursal/interfaces/sucursal.interface';
import { SucursalVentasI } from 'src/sucursal/interfaces/venta.interface';
import { RespuestaData, respuestaI } from './interfaces/respuesta.interface';
import { tipoProductoI } from 'src/productos/enums/productos.enum';
import { Producto } from 'src/productos/schema/producto.schema';
import { flag } from './enums/flag.enum';
import { constants } from 'buffer';

@Injectable()
export class VentaService {

  constructor(
    @InjectModel(Venta.name) private  readonly  VentaSchema:Model<Venta>,
    private readonly SucursalService:SucursalService,
    @InjectModel(DetalleVenta.name) private readonly DetalleVenta:Model<DetalleVenta>
   
){}
  async findAll(ventaDto:VentaDto) { 
      const gafas= await this.ventaPorProducto(tipoProductoI.GAFA, ventaDto.fechaInicio, ventaDto.FechaFin)
      const lc= await this.ventaPorProducto(tipoProductoI.LENTE_DE_CONTACTO,ventaDto.fechaInicio, ventaDto.FechaFin)
      const monturas= await this.ventaPorProducto(tipoProductoI.MONTURA,ventaDto.fechaInicio, ventaDto.FechaFin)
     
      const dataVenta= await this.ventaPorProductos([tipoProductoI.MONTURA,tipoProductoI.LENTE_DE_CONTACTO,tipoProductoI.GAFA ],ventaDto.fechaInicio, ventaDto.FechaFin)
      const dataPorSucursal= await this.ventaPorProductoSucursal([tipoProductoI.MONTURA,tipoProductoI.LENTE_DE_CONTACTO,tipoProductoI.GAFA ],ventaDto.fechaInicio, ventaDto.FechaFin, ventaDto)
      const  total= gafas.total + lc.total + monturas.total 
      const respuesta={
          data:{
            fecha:{inicio:ventaDto.fechaInicio, fin:ventaDto.FechaFin},
            dataVenta
          },
          dataSucursal:{
           dataPorSucursal
          }
      }

    return respuesta
}



 private sacarTotalVenta(venta:SucursalVentasI[]){//saca en dinero
  const totalVenta:number=venta.reduce((total, venta)=> total + venta.totalVenta,0)
  return totalVenta
 }
 private sacarTotalVentaCantidad(venta:SucursalVentasI[]){ //saca la cantidad de ventas
  const totalCantidadVenta:number= venta.reduce((total,venta)=>total + venta.cantidadVentas,0)
  return totalCantidadVenta
 }
 private cantidaSucursal(venta:SucursalVentasI[]){
   const sucursal:number= venta.length
   return sucursal
 }

 private ticketPromedio(totalVenta:number, cantidadTotaVenta:number){
  const tkPromedio= totalVenta/ cantidadTotaVenta
  return tkPromedio ? tkPromedio: 0
 }



async ventaPorProducto(tipo:tipoProductoI, fechaInicio:string, FechaFin:string){
  const producto:VentaPorProductoI[]= await this.DetalleVenta.aggregate([
   {
     $lookup:{
       from:'Producto',
       localField:'producto',
       foreignField:'_id',
       as :'productoInfo'
     }
   },
   {
     $match:{'productoInfo.tipoProducto':tipo}

   },
   {
    $match:{
      fechains:{$gte: new Date(fechaInicio),  $lte: new Date(FechaFin)}
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
    producto:productoNombre[0],
    cantidad:cantidad,
    total:total,
    ticketPromedio 
 
   }
  return resultado
}



async ventaPorProductos(tipo:tipoProductoI[], fechaInicio:string, FechaFin:string){
    const ventaProducto:any[]=[]
    for( let tipoProducto of tipo){
      const producto:VentaPorProductoI[]= await this.DetalleVenta.aggregate([
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
         producto:productoNombre[0] ?productoNombre[0] : tipoProducto ,
         cantidad:cantidad,
         total:total,
         ticketPromedio 
      
        }
        ventaProducto.push(resultado)
       
    }
    return ventaProducto
}







async ventaPorProductoSucursal(tipo:tipoProductoI[], fechaInicio:string, FechaFin:string, ventaDto:VentaDto){
  const resultadoData:any[]=[]
  for(let tipoProducto of tipo){
    for (let suscursal of ventaDto.sucursal){
      const suscursalProdcuto = await this.SucursalService.buscarScursal(new Types.ObjectId(suscursal))  
      const producto:VentaPorProductoI[]= await this.DetalleVenta.aggregate([
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
         $match: {'ventaInfo.sucursal': new Types.ObjectId(suscursal)}
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
 
  return resultadoData
}




}


