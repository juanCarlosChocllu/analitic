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
    const totalVenta:any[]=[] 
      const gafas= await this.ventaPorProducto(tipoProductoI.GAFA, ventaDto.fechaInicio, ventaDto.FechaFin)
      const lc= await this.ventaPorProducto(tipoProductoI.LENTE_DE_CONTACTO,ventaDto.fechaInicio, ventaDto.FechaFin)
      const monturas= await this.ventaPorProducto(tipoProductoI.MONTURA,ventaDto.fechaInicio, ventaDto.FechaFin)
     
      
      const gafaPorSucursal= await this.ventaPorProductoSucursal(tipoProductoI.MONTURA, ventaDto.fechaInicio, ventaDto.FechaFin, ventaDto)
     const monturaPorSucursal= await this.ventaPorProductoSucursal(tipoProductoI.MONTURA, ventaDto.fechaInicio, ventaDto.FechaFin, ventaDto)
     const lcPorSucursal= await this.ventaPorProductoSucursal(tipoProductoI.LENTE_DE_CONTACTO,ventaDto.fechaInicio, ventaDto.FechaFin, ventaDto)
      const  total= gafas.total + lc.total + monturas.total 
      const respuesta={
          data:{
            fecha:{inicio:ventaDto.fechaInicio, fin:ventaDto.FechaFin},
            total,
            gafas,
            monturas,
            lc
          },
          dataSucursal:{
            gafaPorSucursal,
            monturaPorSucursal,
            lcPorSucursal
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



/*async ventaGafas() {
  const sucursales = ['5acd28b0accb805e243adb81', '5b3fe968accb807d6936e303','5b442aefaccb8041c359e293','5b442b4aaccb8042942226e3'];
  const resultados = [];

  for (let sucursalId of sucursales) {
      try {
       
          const sucursal = await this.SucursalService.buscarScursal(new Types.ObjectId(sucursalId));
          const gafas:VentaPorProductoI[] = await this.DetalleVenta.aggregate([
              {
                  $lookup: {
                      from: 'Producto',
                      localField: 'producto',
                      foreignField: '_id',
                      as: 'productoInfo'
                  }
              },
              {
                  $match: {'productoInfo.tipoProducto': tipoProductoI.GAFA}
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
                  $match: {'ventaInfo.sucursal': new Types.ObjectId(sucursalId)}
              },
              {
                  $project: {
                      _id: 1,
                      producto: {
                          nombre: { $arrayElemAt: ['$productoInfo.tipoProducto', 0] }, // Obtener el primer nombre
                          venta: '$ventaInfo._id',
                          sucursal: '$ventaInfo.sucursal',
                          preciototal: '$preciototal',
                          cantidad: '$cantidad'
                      }
                  }
              }
          ]);
          for(let g of gafas ){
           
            
          }
          const totalCantidad = gafas.reduce((total, item) => total + item.producto.cantidad, 0);
          const totalPrecio = gafas.reduce((total, item) => total + item.producto.preciototal, 0);

          const resultado = {
              productoNombre: gafas.length > 0 ? gafas[0].producto.nombre : '', 
              cantidad: totalCantidad,
              total: totalPrecio,
              sucursal: sucursal
          };

          resultados.push(resultado);
      } catch (error) {
          console.error(`Error al procesar la sucursal ${sucursalId}: ${error.message}`);
      }
  }

  return resultados;
}*/


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






async ventaPorProductoSucursal(tipo:tipoProductoI, fechaInicio:string, FechaFin:string, ventaDto:VentaDto){
  const resultadoData:any[]=[]
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
        $match:{'productoInfo.tipoProducto':tipo}
   
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
       producto:productoNombre[0],
       cantidad:cantidad,
       total:total,
       ticketPromedio 
    
      }
      resultadoData.push(resultado)
  }

  return resultadoData
}


}


