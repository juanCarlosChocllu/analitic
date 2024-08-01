import { BadRequestException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DetalleVenta, SuscursalExcel, Venta, VentaExcel } from './schemas/venta.schema';
import { Model, Types} from 'mongoose';
import { VentaDto, VentaExcelDto } from './dto/venta.dto';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { VentaPorProductoI} from './interfaces/venta.interface';
import { tipoProductoI } from 'src/productos/enums/productos.enum';
import { respuestaI } from './interfaces/respuesta.interface';
import { LenteI } from './interfaces/lente.interface';
import { CacheData } from './interfaces/cache.interface';
import { HttpAxiosService } from 'src/providers/http.service';
import { VentaExcelI } from './interfaces/ventaExcel.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class VentaService {
  private readonly logger = new Logger(VentaExcel.name);
  constructor(
    private readonly SucursalService:SucursalService,
    @InjectModel(DetalleVenta.name) private readonly DetalleVentaSchema:Model<DetalleVenta>,
    @InjectModel(Venta.name) private readonly VentaSchema:Model<Venta>,
    @InjectModel(VentaExcel.name) private readonly VentaExcelSchema:Model<VentaExcel>,
    @InjectModel(SuscursalExcel.name) private readonly sucursalExcelSchema:Model<SuscursalExcel>,
    private readonly httpAxiosService:HttpAxiosService
   
){}


/*async findAll(ventaDto: VentaDto) {
  
 

  // Si no hay datos en caché o los datos no son válidos, consulta la base de datos
  const dataVenta = await this.ventaPorProductos(
    [tipoProductoI.MONTURA, tipoProductoI.LENTE_DE_CONTACTO, tipoProductoI.GAFA],
    ventaDto.fechaInicio,
    ventaDto.FechaFin,
    ventaDto
  );
  const dataPorSucursal = await this.ventaPorProductoSucursal(
    [tipoProductoI.MONTURA, tipoProductoI.LENTE_DE_CONTACTO, tipoProductoI.GAFA],
    ventaDto.fechaInicio,
    ventaDto.FechaFin,
    ventaDto
  );

  const ventaTotal = this.ventaTotal(dataVenta);
  const ventaPorSucursal = this.ventaTotal(dataPorSucursal);

  const respuesta: CacheData = {
    data: {
      fecha: { inicio: ventaDto.fechaInicio, fin: ventaDto.FechaFin },
      ventaTotal,
      dataVenta
    },
    dataSucursal: {
      fecha: { inicio: ventaDto.fechaInicio, fin: ventaDto.FechaFin },
      ventaPorSucursal,
      cantidadSucursales: ventaDto.sucursal.length,
      dataPorSucursal
    }
  };


  return respuesta;
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
*/
    async allExcel(){
     const dataExcel = await this.httpAxiosService.reporte()
     const ventaSinServicio= this.quitarServiciosVentas(dataExcel)
     const ventaSinParaguay= this.quitarSucursalParaguay(ventaSinServicio)
     const ventaLimpia= this.quitarDescuento(ventaSinParaguay)
   
      this.extraeSucursales(ventaLimpia)
    
    this.guardaVentaLimpiaEnLaBBDD(ventaLimpia)
     return {status:HttpStatus.CREATED}
}

  private quitarServiciosVentas(venta:VentaExcelI[]):VentaExcelI[]{
      const nuevaVenta = venta.filter((ventas)=> ventas.producto !== 'SERVICIO' )
      return nuevaVenta
    
  }
  private quitarSucursalParaguay(venta:VentaExcelI[]):VentaExcelI[]{
    const nuevaVenta = venta.filter((ventas)=> ventas.sucursal !== 'OPTICENTRO PARAGUAY')
    return nuevaVenta

  }
  private quitarDescuento(venta:VentaExcelI[]){
    const nuevaVenta = venta.filter((ventas)=> ventas.producto !== 'DESCUENTO')
    return nuevaVenta    
  }

  private async guardaVentaLimpiaEnLaBBDD(Venta:VentaExcelI[]){
    try {
      for(let data of Venta){
        await this.VentaExcelSchema.create(data)
       }
    } catch (error) {
         throw new BadRequestException()
    }

  }

   async ventaExel(ventaDto:VentaExcelDto){
        const venta = await this.ventaExcel(ventaDto)
        const ventaSucursal = await this.ventaExcelSucursal(ventaDto)
        
        const total = venta.reduce((total, ve)=> total + ve.montoTotal ,0)
        const cantidad = venta.reduce((total, ve)=> total +  ve.cantidad, 0)
        const ticketPromedio = this.ticketPromedio(total, cantidad)
        const resultado ={
          total,
          cantidad,
          ticketPromedio,
          venta,
          ventaSucursal
        }
        return resultado
    }



  private async ventaExcel(ventaDto:VentaExcelDto){
    const venta = await this.VentaExcelSchema.aggregate([
      {
        $match:{
          fecha:{$gte: new Date(ventaDto.fechaInicio), 
            $lte: new Date(ventaDto.FechaFin)}}
      },
      {
        $group:{
          _id: '$producto',
          cantidad:{$sum:'$cantidad'},
          montoTotal:{$sum:'$montoTotal'}
        },
      },
     ])
    return venta
  }

  private async  ventaExcelSucursal(ventaDto:VentaExcelDto){
    const ventaSucursal:any[]=[]
    for(let sucursal of ventaDto.sucursal){  
      const venta = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            fecha:{$gte: new Date(ventaDto.fechaInicio), 
              $lte: new Date(ventaDto.FechaFin)},
             sucursal:sucursal
            
            }
        },
        {
          $group:{
            _id:'$producto',
            cantidad:{$sum:'$cantidad'},
            montoTotal:{$sum:'$montoTotal'}
          },
        },
        {
          $project: {
            producto: '$_id.producto',
            sucursal: '$_id.sucursal',
            cantidad: 1,
            montoTotal: 1
          }
        }
     ])
     const resultado = {
       sucursal:sucursal,
        data:venta.map((elemeto=>{
          return{
            producto:elemeto._id,
            cantidad:elemeto.cantidad,
            montoTotal:elemeto.montoTotal
          }
        })) 
        }
        ventaSucursal.push(resultado)
    }
    const data=  this.calcularDatosSucursal(ventaSucursal)
    const resultado = {
      data,
      ventaSucursal
    }
    return   resultado
  }


  private calcularDatosSucursal(ventaPorSucursal:any[]){
    const totalVenta:number[]=[]
    const cantidadTotal:number[]=[]
     for( let venta of ventaPorSucursal){
        const total= venta.data.reduce((total:number, venta:VentaExcelI)=>total  + venta.cantidad, 0)
        const cantidad =venta.data.reduce((total:number, venta:VentaExcelI)=>total  + venta.cantidad, 0)
        totalVenta.push(total)
        cantidadTotal.push(cantidad)     
     }
     const total = totalVenta.reduce((total, venta)=> total + venta,0)
     const  cantidad = cantidadTotal.reduce((total, cantidad)=> total + cantidad,0)
     const ticketPromedio =  this.ticketPromedio(total, cantidad)
      this.ticketPromedio 
     const resultado= {
       total ,
       cantidad ,
        ticketPromedio 
     }
     return resultado
  }

     private async extraeSucursales(venta:VentaExcelI[]){
      const suscursales = venta.map((v)=> v.sucursal)
    const sucursalesSinRepetir = [...new Set(suscursales)]
    await  this.guardarScucursal(sucursalesSinRepetir)
      
  } 

    private async guardarScucursal(sucursal:string[]){
    for( let nombre of sucursal){
      const sucursalBBDD= await this.sucursalExcelSchema.findOne({nombre:nombre})
       if(!sucursalBBDD){
        const sucursal =  await this.sucursalExcelSchema.create({nombre:nombre})
        sucursal.save()      
       }
    }
  }
 
  private ticketPromedio(totalVenta:number, cantidadTotaVenta:number){
    const tkPromedio= totalVenta/ cantidadTotaVenta
    return tkPromedio ? tkPromedio: 0
   }
  
  /*  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    this.allExcel()
    this.logger.debug('descarga completa');
  }*/

  async sucursalExcel(){
   const suscursales = await  this.sucursalExcelSchema.find()
   return suscursales
  }

}






