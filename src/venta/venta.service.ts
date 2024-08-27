import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AsesorExcel, DetalleVenta, EmpresaExcel, SuscursalExcel, Venta, VentaExcel } from './schemas/venta.schema';
import { Model, set, Types} from 'mongoose';
import { VentaDto, VentaExcelDto } from './dto/venta.dto';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { ProductoVentaI, VentaI, VentaPorProductoI, VentaTotalI} from './interfaces/venta.interface';
import { tipoProductoI } from 'src/productos/enums/productos.enum';
import { respuestaI } from './interfaces/respuesta.interface';
import { LenteI } from './interfaces/lente.interface';
import { CacheData } from './interfaces/cache.interface';
import { HttpAxiosService } from 'src/providers/http.service';
import { VentaExcelI } from './interfaces/ventaExcel.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { dataEmpresa } from './data.empresas';
import { log } from 'util';
import { diasDelAnio } from 'src/providers/util/dias.anio';
import { productos } from './enums/productos.enum';
import { Producto } from 'src/productos/schema/producto.schema';
import { constants } from 'buffer';
import { AsesorExcelI } from './interfaces/asesor.interface';
import { SucursalModule } from 'src/sucursal/sucursal.module';

import { parseNumber } from './util/validar.numero.util';
import { Empresa } from 'src/empresa/schemas/empresa.schema';

@Injectable()
export class VentaService {
  private readonly logger = new Logger(VentaExcel.name);
  constructor(
    private readonly SucursalService:SucursalService,
    @InjectModel(DetalleVenta.name,NombreBdConexion.mia) private readonly DetalleVentaSchema:Model<DetalleVenta>,
    @InjectModel(Venta.name,NombreBdConexion.mia) private readonly VentaSchema:Model<Venta>,
    @InjectModel(VentaExcel.name,NombreBdConexion.oc) private readonly VentaExcelSchema:Model<VentaExcel>,
    @InjectModel(SuscursalExcel.name,NombreBdConexion.oc) private readonly sucursalExcelSchema:Model<SuscursalExcel>,
    @InjectModel(EmpresaExcel.name,NombreBdConexion.oc) private readonly EmpresaExcelSchema:Model<SuscursalExcel>,
    @InjectModel(AsesorExcel.name,NombreBdConexion.oc) private readonly AsesorExcelSchema:Model<AsesorExcel>,
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
  const dataAnio = diasDelAnio(2023);
  
 // for (let data of dataAnio) {
  //  const [mes, dia] = data.split('-');
   // console.log(mes , dia, 2023);
    
    try {
      const dataExcel = await this.httpAxiosService.reporte('08', '03', 2023);
      const ventaSinServicio =  this.quitarServiciosVentas(dataExcel);
      const ventaSinParaguay = this.quitarSucursalParaguay(ventaSinServicio);
      const ventaLimpia = this.quitarDescuento(ventaSinParaguay);
   
      
      await  this.guardarEmpresaYsusSucursales();
       await this.guardarAsesorExcel(ventaLimpia)

      await this.guardaVentaLimpiaEnLaBBDD(ventaLimpia);
    } catch (error) {

      if (error instanceof NotFoundException) {
       // console.log(`Archivo no encontrado para la fecha ${dia}/${mes}/2023. Continuando con el siguiente día.`);
       // continue;
      } else {
        throw error;
      }
   // }
  }
  
  return {status: HttpStatus.CREATED};
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
    
    
    const nuevaVenta = venta.filter((ventas)=> ventas.cantidad !== -1)
    return nuevaVenta    
  }

  private async guardaVentaLimpiaEnLaBBDD(Venta:VentaExcelI[]){
    try {
      for(let data of Venta){


        const sucursal = await this.sucursalExcelSchema.findOne({nombre:data.sucursal})
     
      
         
        if(sucursal){ 
          const asesor = await this.AsesorExcelSchema.findOne({usuario:data.asesor, sucursal:sucursal._id}) 
            try {
              const dataVenta={
                fecha: data.fecha,
                sucursal: sucursal._id,
                empresa:sucursal.empresa,
                numeroTicket: data.numeroTicket,
                aperturaTicket:data.aperturaTicket,
                producto: data.producto,
                importe: parseNumber(data.importe) ,
                cantidad: data.cantidad,
                montoTotal: data.montoTotal,
                asesor: asesor._id
              }
              
              await this.VentaExcelSchema.create(dataVenta)
              
            } catch (error) {
      
               throw error
            }
          

            }
          
       }
    } catch (error) {
       console.log(error);
       
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
          cantidadSucursal:ventaDto.sucursal.length,
          fechaInicio:ventaDto.fechaInicio,
          fechaFin: ventaDto.FechaFin,
          total,
          cantidad,
          ticketPromedio,
          venta,
          ventaSucursal
        }
       // console.log(resultado);
        
        return resultado
    }


    private async ventaExcel(ventaDto: VentaExcelDto) {//prueba por cadena

      const venta = await this.VentaExcelSchema.aggregate([
          {
              $match: {
                  fecha: {
                      $gte: new Date(ventaDto.fechaInicio),
                      $lte: new Date(ventaDto.FechaFin)
                  },
                  empresa: new Types.ObjectId(ventaDto.empresa),
                  producto: { $ne: 'DESCUENTO' }
              }
          },
          {
            $group: {
              _id: '$producto', 
              cantidad: { $sum: '$cantidad' },  
              montoTotal: { $sum: '$importe' }  
            }
          },
          {
              $project: {
                  _id: 0,  
                  producto: '$_id', 
                  cantidad: 1,  
                  montoTotal: 1  
              }
          }
      ]);      

        
  return venta;
  }
  

  private async  ventaExcelSucursal(ventaDto:VentaExcelDto){
    const ventaSucursal:any[]=[]
    for(let sucursal of ventaDto.sucursal){
      const venta = await this.VentaExcelSchema.aggregate([
        {
          $match:{
            fecha:{$gte: new Date(ventaDto.fechaInicio), 
              $lte: new Date(ventaDto.FechaFin)},
              sucursal:new Types.ObjectId(sucursal),
              producto:{$ne:'DESCUENTO'}
            }
        },
        {
          $group:{
            _id:'$producto',
            cantidad: { $sum: {
              $cond:{
                if:{$ne:['$producto','DESCUENTO']},
                then:'$cantidad',
                else:0
              }
            } },
            montoTotal: { $sum: {
              $cond:{
                if:{$ne:['$producto','DESCUENTO'] },
                then:'$importe',
                else:0
              }
            }},
          },
        },
        {
          $project: {

            producto: '$_id.producto',
            sucursal: '$_id.sucursal',
            asesor:1,
            cantidad: 1,
            montoTotal: 1,
            totalImporte:1

          }
        }
     
        
     ])
     console.log(venta);
     
     
     const resultado = {
             sucursal: await this.extraerSucursal(sucursal),
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
        const total= venta.data.reduce((total:number, venta:VentaExcelI)=>total  + venta.montoTotal, 0)
        const cantidad =venta.data.reduce((total:number, venta:VentaExcelI)=>total  + venta.cantidad, 0)
        totalVenta.push(total)
        cantidadTotal.push(cantidad)     
     }
     const total = totalVenta.reduce((total, venta)=> total + venta,0).toFixed(2)
     const  cantidad = cantidadTotal.reduce((total, cantidad)=> total + cantidad,0)
     const ticketPromedio =  this.ticketPromedio(parseFloat(total), cantidad)
      this.ticketPromedio 
     const resultado= {
       total ,
       cantidad ,
        ticketPromedio 
     }
     return resultado
  }

    /* private async extraeSucursales(venta:VentaExcelI[]){
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
 */
  private ticketPromedio(totalVenta:number, cantidadTotaVenta:number){
    const tkPromedio= totalVenta/ cantidadTotaVenta
    return tkPromedio ? tkPromedio.toFixed(4): 0
   }
  
  /*  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    this.allExcel()
    this.logger.debug('descarga completa');
  }*/

  async sucursalExcel(id:string){
   const suscursales = await  this.sucursalExcelSchema.find({empresa:new Types.ObjectId(id)})  
   return suscursales
  }

  async EmpresaExcel(){
    const empresas = await  this.EmpresaExcelSchema.find()
    return empresas
   }
 

    private async guardarEmpresaYsusSucursales(){

      const data= dataEmpresa()
      
      for (let [empresa, sucursales] of Object.entries(data.empresa)) {
        const empresaData = {
            nombre: empresa
        };
        
        try {
           const empresas = await this.EmpresaExcelSchema.findOne({nombre:empresa})
           if(!empresas){
               await this.EmpresaExcelSchema.create(empresaData);             
            }           
            for (let sucursal of sucursales) {
              const sucursalExiste =  await this.sucursalExcelSchema.findOne({nombre:sucursal})
              if(!sucursalExiste){
                const empresas = await this.EmpresaExcelSchema.findOne({nombre:empresa})
                const sucursalData = {
                  empresa: empresas._id,
                  nombre: sucursal
              };
                await this.sucursalExcelSchema.create(sucursalData);
              }
            } 
           
        } catch (error) {
            console.error(`Error al crear empresa o sucursal para ${empresa}: `, error);
        }
    }
    

   }

   private async guardarAsesorExcel(venta: VentaExcelI[]) {
  
    const data = venta.map((item) => ({
        asesor: item.asesor,
        sucursal: item.sucursal
    }));

    const uniqueData = Array.from(
        new Map(data.map(item => [item.asesor + item.sucursal, item])).values()
    );

    
    for (let data of uniqueData) {
        const sucursal = await this.sucursalExcelSchema.findOne({ nombre: data.sucursal });

        if (sucursal) {
            const usuario = await this.AsesorExcelSchema.findOne({ 
                usuario: data.asesor, 
                sucursal: sucursal._id 
            });

            if (!usuario) {      
                await this.AsesorExcelSchema.create({ usuario: data.asesor, sucursal: sucursal._id });
            } 
        }
    }
}




     
   
     
    
   
        

  

   public async ventaSucursalExcel(ventaDto:VentaExcelDto){
    const listaAsesor: AsesorExcelI[]=[]
   for(let sucursal of ventaDto.sucursal){
        const asesores:AsesorExcelI[] = await this.AsesorExcelSchema.find({sucursal:new  Types.ObjectId(sucursal)})
      listaAsesor.push(...asesores)
    }
    const ventaPorAsesor= await this.ventaPorAsesores(listaAsesor, ventaDto.fechaInicio, ventaDto.FechaFin)
    return ventaPorAsesor
    }



    private async ventaPorAsesores(asesores: AsesorExcelI[], fechaInicio: string, fechaFin: string) {

      const venPorAsesor: any[] = [];
     
      for (let asesor of asesores){
        const sucursal= await this.sucursalExcelSchema.findOne({_id:asesor.sucursal}).select('nombre')
       const asesorNombre= await this.AsesorExcelSchema.findOne({_id:asesor.id}).select('usuario')
       const resultado = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            asesor: new Types.ObjectId(asesor.id),
            fecha: {
              $gte: new Date(fechaInicio),
              $lte: new Date(fechaFin)
            }
          }
        },
        {
          $group: {
            _id: null,
            ventaTotal: { 
              $sum: {
                $cond: {
                  if: { $eq: ["$aperturaTicket", '1'] },
                  then: '$montoTotal',
                  else: 0
                }
              }
            },
            totalTicket: {
              $sum: {
                $cond: {
                  if: { $eq: ["$aperturaTicket", '1'] },
                  then: 1,
                  else: 0
                }
              }
            },
            cantidad: { $sum: {
              $cond:{
                if:{$ne:['$producto','DESCUENTO']},
                then:'$cantidad',
                else:0
              }
            } },
            totalImporte:{
              $sum:{
                $cond:{
                  if:{$ne:['$producto','DESCUENTO'] },
                  then:'$importe',
                  else:0
                }
              }
            },
            totalDescuentos:{
              $sum:{
                $cond:{
                  if:{$eq:['$producto','DESCUENTO'] },
                  then:'$importe',
                  else:0
                }
              }
            }
            
          }
        },
        {
          $project: {
            ventaTotal: 1,
            cantidad:1,
            totalTicket: 1,
            importeTotalSuma:{
              $subtract:[ '$totalImporte', '$totalDescuentos']
            },
         
            ticketPromedio: {
              $cond: {
                if: { $ne: ['$totalTicket', 0] },
                then: { $divide: ['$ventaTotal', '$totalTicket'] },
                else: 0
              }
            },

            precioPromedio: {
              $cond: {
                if: { $ne: ['$cantidad', 0] },
                then: { $round: [{ $divide: ['$ventaTotal', '$cantidad'] }, 2] },
                else: 0
              }
            },
            unidadPorTicket:{
              $cond:{
                if:{$ne:['$cantidad' ,0]},
                then:{$divide:['$cantidad','$totalTicket']},
                else:0
              }
            },
          

          }
        }
        
      ]);
       

      const resultadoFinal = resultado.length > 0 ? resultado[0] : {
        _id:null,
        unidadPorTicket:0,
        importeTotalSuma:0,
        ventaTotal: 0,
        cantidad: 0,
        totalTicket: 0,
        ticketPromedio: 0,
        precioPromedio: 0
      };

      const data = {
        sucursal: sucursal.nombre,
        asesor: asesorNombre.usuario,
        ...resultadoFinal
      };
      
      venPorAsesor.push(data);
        
    }
        
   return   venPorAsesor
  }

    private async extraerSucursal(sucursal:Types.ObjectId){
        const su = await this.sucursalExcelSchema.findOne({_id:sucursal}).select('nombre')
        return su.nombre
    }
    public async gestionExcel(ventaDto:VentaExcelDto){
      const data={
        sucursales:0,
        totalVentas:0,
        tcPromedio:0,
        ventaDiariaPorLoca:0,
        unidadPorTickect:0
    }
      const dataSucursal:any[]=[]
        for(let  idsucursal of ventaDto.sucursal){
          const sucursal  = await this.extraerSucursal(idsucursal) 
          const sucusarsalData = await  this.VentaExcelSchema.aggregate([
            {
              $match:{
                sucursal: new Types.ObjectId(idsucursal),
                fecha: {
                  $gte: new Date(ventaDto.fechaInicio),
                  $lte: new Date(ventaDto.FechaFin)
                },
              }
            },

            {
              $group:{
                _id:'$sucursal',
                ventaTotal:{ 
                  $sum:{
                    $cond:{
                      if:{$eq:["$aperturaTicket", '1']},
                      then:'$montoTotal',
                      else:0
                    }
                  }
                  }
               ,
                totalTicket: { 
                  $sum: { 
                    $cond: {
                      if: { $eq: ["$aperturaTicket", '1'] }, 
                      then: 1, 
                      else: 0 
                    } 
                  }
                },
                totalImporte:{
                  $sum:{
                    $cond:{
                      if:{$ne:['$producto','DESCUENTO'] },
                      then:'$importe',
                      else:0
                    }
                  }
                },
                totalDescuentos:{
                  $sum:{
                    $cond:{
                      if:{$eq:['$producto','DESCUENTO'] },
                      then:'$importe',
                      else:0
                    }
                  }
                },

                cantidad: { $sum: {
                  $cond:{
                    if:{$ne:['$producto','DESCUENTO']},
                    then:'$cantidad',
                    else:0
                  }
                } },
              },
            },
            {
              $project:{
                _id: 0,
                ventaTotal: 1,
                totalTicket: 1,
                cantidad: 1,
                importeTotalSuma:{
                  $subtract:[ '$totalImporte', '$totalDescuentos']
                },
                ticketPromedio:{
                    $cond:{
                     if:{ $ne:['$totalTicket',0]},
                      then:{$round:[{$divide:['$ventaTotal','$totalTicket']},2]},
                      else:0
                  }
                },
                unidadPorTicket:{
                  $cond:{
                    if:{$ne:['$cantidad' ,0]},
                    then:{$round:[{$divide:['$cantidad','$totalTicket']},2]},
                    else:0
                  }
                },

                precioPromedio:{
                  $cond:{
                    if:{$ne:['$ventaTotal',0] },
                     then:{$round:[{$divide:['$ventaTotal','$cantidad']},2]} ,
                     else:0
                  }
                }
                
              }
              
            }
        
          ])
          
          const resultadoFinal = sucusarsalData.length > 0 ? sucusarsalData[0] : {
            _id:null,
            ventaTotal: 0,
            totalTicket: 0,
            cantidad:0,
            ticketPromedio: 0,
            unidadPorTicket: 0,
            precioPromedio: 0
          };
          

          const data={
            sucursal:sucursal,
            ...resultadoFinal,
          }
          
          dataSucursal.push(data)
        } 
        const cantidad = dataSucursal.reduce((total ,item)=>total + item.cantidad, 0)
        const ticket = dataSucursal.reduce((total ,item)=>total + item.totalTicket, 0)
        data.sucursales = ventaDto.sucursal.length
        data.totalVentas = dataSucursal.reduce((total , item)=>total + item.ventaTotal,0)
        data.unidadPorTickect = parseFloat((cantidad/ticket).toFixed(2))
        const resultado={
          ...data,
          dataSucursal
        }
        
        return resultado
    }
  }
  
  








