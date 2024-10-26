import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { VentaExcel } from "./schemas/venta.schema";
import { NombreBdConexion } from "src/enums/nombre.db.enum";
import { Model, Types } from "mongoose";
import { EmpresaService } from "src/empresa/empresa.service";
import { KpiDto } from "./dto/kpi.venta.dto";
import { FiltroVentaI } from "./interfaces/filtro.venta.interface";
import { SucursalService } from "src/sucursal/sucursal.service";
import { productos } from "./enums/productos.enum";

import { InformacionVentaDto } from "./dto/informacion.venta.dto";
import { log } from "node:console";

@Injectable()
export class VentaKpiService {

    constructor( @InjectModel(VentaExcel.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<VentaExcel>,
    private readonly empresaService: EmpresaService,
    private readonly sucursalService: SucursalService,
){

    }


    
private async verificacionEmpresa(kpiDto:KpiDto){  


  
    const empresa = await this.empresaService.buscarEmpresa(kpiDto.empresa)
    if(empresa.nombre === 'OPTICENTRO'){
      return this.kpiOpticentro(kpiDto)
  
    }
    else if(empresa.nombre=== 'ECONOVISION'){
      return this.kpiEconovision(kpiDto)
    }else if(empresa.nombre=== 'TU OPTICA'){
      return this.kpiTuOptica(kpiDto)
  
    }else if(empresa.nombre=== 'OPTISERVICE S.R.L'){
      return this.kpiOptiservice(kpiDto)
  
    }
    
    
    else{
      throw new NotFoundException()
    }
    
  }
  
  
  
    public async kpi(kpiDto: KpiDto) {
      return this.verificacionEmpresa(kpiDto)
     
    }
  
  //'-----------------------kpi econovision--------------------
    
    private async kpiEconovision(kpiDto: KpiDto){
      const data:any[]=[]
      let filtrador:FiltroVentaI={
        fecha: {
          $gte: new Date(kpiDto.fechaInicio),
          $lte: new Date(kpiDto.FechaFin),
          
        },
      }      
     kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: kpiDto.tipoVenta.map((id)=>new Types.ObjectId( id))} : filtrador
      for (let  su of kpiDto.sucursal ){
        const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))      
        filtrador.sucursal= new Types.ObjectId(su)  
        const dataKpi = await this.VentaExcelSchema.aggregate([
          {
            $match:{
              ...filtrador,
            //producto:productos.lente
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
              from:'tipolentes',
              foreignField:'_id',
              localField:'tipoLente',
              as:'tipoLente'
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
            $unwind:{ path: '$tipoLente', preserveNullAndEmptyArrays: true }
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
                      {$eq:['$tratamiento.nombre','ANTIREFLEJO']},
                      {$eq:['$tratamiento.nombre','BLUE SHIELD']},
                      {$eq:['$tratamiento.nombre','GREEN SHIELD']},
                   
                    ]},
                    then:'$cantidad',
                    else:0
                  }
                }
              },
              tickets:{
                $sum:{
                  $cond:{
                    if:{$and:[
                      {$eq:['$aperturaTicket', '1']},
                      {$ne:['$producto', 'OTRO PRODUCTO']}
                      
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
                      {$eq:['$tipoLente.nombre','PROGRESIVO']}
                      //{$eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']},
                      //{$eq:['$marcaLente.nombre','DISEÑO DIGITAL']},
                      //{$eq:['$marcaLente.nombre','DIGITAL PLATINIUM']},
                      //{$eq:['$marcaLente.nombre','DIGITAL GOLD']},
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
                    if:{$eq:['$tipoLente.nombre','OCUPACIONAL']},
                    then:'$cantidad',
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
                       /* { $eq: ["$tipoColor.nombre", "VIOLETA"] },//NO SE ENCONTRO EN LA DB
                        { $eq: ["$tipoColor.nombre", "NARANJA"] },//NO SE ENCONTRO EN LA DB
                        { $eq: ["$tipoColor.nombre", "AZUL"] },//NO SE ENCONTRO EN LA DB
                        { $eq: ["$tipoColor.nombre", "ROSADO"] },//NO SE ENCONTRO EN LA DB
                        { $eq: ["$tipoColor.nombre", "VERDE HI INDEX"] },//NO SE ENCONTRO EN LA DB
                        { $eq: ["$tipoColor.nombre", "DRIVE"] },  //NO SE ENCONTRO EN LA DB
                        { $eq: ["$tipoColor.nombre", "GRIS"] },   //NO SE ENCONTRO EN LA DB
                        { $eq: ["$tipoColor.nombre", "CAFE"] },   //NO SE ENCONTRO EN LA DB*/
                      ]
                    },
                    then: "$cantidad",
                    else: 0
                  }
                }
              },
  
           
            
  
           
            }
          },
  
          {
            $project:{
              lentes:1,
              antireflejo:1,
              tickets:1,
              porcentajeAntireflejo: {
                $cond:{
                  if :{$gt: ['$lentes', 0]},
                  then:{
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
                  else:0
                }
               
              
              },
              progresivos:1,
              ocupacional:1,
              progresivosOcupacionales: { $add: ['$progresivos', '$ocupacional'] },
              progresivosOcupacionalesPorcentaje: {
               $cond:{
                if:{$gt:['$lentes',0]},
                then:{
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
                else:0

               }
              },
              porcentajeProgresivos: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
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
                  else:0
                }

             
                
              
              },
              porcentajeOcupacionales: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
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
                  else:0
                }
               
              
              },
              fotosensibles:1,
              procentajeFotosensibles:{
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
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
                  else:0

                }
              
              },
            
              
                
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
  
    

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  //------------------------------
  
    private async kpiOpticentro(kpiDto: KpiDto){
      let filtrador:FiltroVentaI={
        fecha: {
          $gte: new Date(kpiDto.fechaInicio),
          $lte: new Date(kpiDto.FechaFin),
          
        },
      
      }
      kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: kpiDto.tipoVenta.map((id)=>new Types.ObjectId( id))} : filtrador
      const data:any[]=[]
      for (let su of kpiDto.sucursal) {
        filtrador.sucursal = new Types.ObjectId(su)  
        const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))
        const dataKpi = await this.VentaExcelSchema.aggregate([
          {
            $match: {
              ...filtrador,
              //producto:productos.lente
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
                from:'tipolentes',
                foreignField:'_id',
                localField:'tipoLente',
                as:'tipoLente'
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
              $unwind:{ path: '$tipoLente', preserveNullAndEmptyArrays: true }
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
  
                tickets:{
                  $sum:{
                    $cond:{
                         if:{$and:[
                      {$eq:['$aperturaTicket', '1']},
                      {$ne:['$producto', 'OTRO PRODUCTO']}
                      
                    ]},
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
                        {$eq:['$tratamiento.nombre','ANTIREFLEJO']}
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
                        {$eq:['$tipoLente.nombre','PROGRESIVO']}
                       /* {$eq:['$marcaLente.nombre','TALLADO TRADICIONAL']},
  
                        {$eq:['$marcaLente.nombre','DISEÑO DIGITAL']},
  
                        {$eq:['$marcaLente.nombre','DIGITAL HP OPTIMIZADO']},
  
                        {$eq:['$marcaLente.nombre','DIGITAL HP MUNDO TACTIL']},//dudoso
  
                        //digital driver
                        //gtz byte zesse
                        {$eq:['$marcaLente.nombre','DIGITAL PRIMER USUARIO']},
                        {$eq:['$marcaLente.nombre','DIGITAL SENIOR']},
                        {$eq:['$marcaLente.nombre','AILENS']},*/
                      ]},
                      then:'$cantidad',
                      else:0
                    }
                  }
                
                },
                ocupacional:{
                  $sum:{
                    $cond:{
                      if:{$eq:['$tipoLente.nombre','OCUPACIONAL']},
                      then:'$cantidad',
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
                ocupacionalProgresivos: 1,
                antireflejo: 1,
                tickets:1,
                progresivosOcupacionales: { $add: ['$progresivos', '$ocupacional'] },
                progresivosOcupacionalesPorcentaje: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                    then:{
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
                    else:0

                  }
                },
                porcentajeAntireflejo: {
                  $cond:{
                    if:{$gt:['$lentes',0]},
                    then:{
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
                    else:0

                  }
                
                
                },
                porcentajeProgresivos: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                   then:{
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
                   else:0
                }
                
                },
                porcentajeOcupacionales: {
                 $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
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
                  else:0
                 },
              
                
                }
  
             
          
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
  
    async kpiInformacion(sucursal:string,informacionVentaDto :InformacionVentaDto){
      const filtrador:FiltroVentaI ={
        fecha:{
          $gte:new Date(informacionVentaDto.fechaInicio),
          $lte:new Date(informacionVentaDto.fechaFin)
        },
        sucursal:new Types.ObjectId(sucursal)
      }
      
      informacionVentaDto.tipoVenta.length > 0 ? filtrador.tipoVenta= {$in: informacionVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
      
      const [antireflejo, progresivos, ocupacional, su] =  await Promise.all([
         this.kpiAntireflejo(filtrador),
         this.kpiProgresivos(filtrador),
         this.kpiOcupacional(filtrador),
         this.sucursalService.listarSucursalId(new Types.ObjectId(sucursal))
      ])   
        return {antireflejo, progresivos, ocupacional,sucursal:su.nombre }
    }
  
    private async kpiAntireflejo(filtrador:FiltroVentaI){
        const antireflejo = await this.VentaExcelSchema.aggregate([
            {
                $match:filtrador
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
                $unwind:'$tratamiento'
              },
              
          
              {
                $group:{
                    _id:'$tratamiento.nombre',
                    cantidad:{$sum:'$cantidad'}
                }
              },
      
            {
                $group:{
                    _id:null,
                    lentes:{$sum:'$cantidad'},
                    tratamientos:{
                        $push:{
                            tratamiento:'$_id',
                            cantidad:'$cantidad'
                        }
                    }
                }
            },
            
             
            {
                $project:{
                    _id:0,
                    lentes:'$lentes',
                    tratamiento:{
                          
                            $map:{
                                input:'$tratamientos',
                                as:'trata',
                                in:{
                                    tratamiento:'$$trata.tratamiento',
                                    cantidad:'$$trata.cantidad',
                                    porcentaje:{
                                        $round: [
                                            {
                                              $multiply: [
                                                { $divide: ['$$trata.cantidad','$lentes'] },
                                                100
                                              ]
                                            },
                                            2
                                          ]
                                    }
                                }
                       
                   
                        }
                    }
                  
                }
            }
        

             
        ])

        return antireflejo

    }
  
    private async kpiProgresivos(filtrador:FiltroVentaI){
        const progresivos= await  this.VentaExcelSchema.aggregate([{
            $match:filtrador

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
              from:'tipolentes',
              foreignField:'_id',
              localField:'tipoLente',
              as:'tipoLente'
            }
          },

          {
            $unwind:'$marcaLente'
          },
          {
            $unwind:'$tipoLente'
          },
          {
            $match:{
                'tipoLente.nombre':{$eq:'PROGRESIVO'}
            }
          },
          {
            $group:{
                _id:'$marcaLente.nombre',
                cantidad:{$sum:'$cantidad'}
            }
          }
    ])
        return progresivos
    }
    private async kpiOcupacional(filtrador:FiltroVentaI){
        const progresivos= await  this.VentaExcelSchema.aggregate([{
            $match:filtrador

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
              from:'tipolentes',
              foreignField:'_id',
              localField:'tipoLente',
              as:'tipoLente'
            }
          },

          {
            $unwind:'$marcaLente'
          },
          {
            $unwind:'$tipoLente'
          },
          {
            $match:{
                'tipoLente.nombre':{$eq:'OCUPACIONAL'}
            }
          },
          {
            $group:{
                _id:'$marcaLente.nombre',
                cantidad:{$sum:'$cantidad'}
            }
          }    
    ])
        return progresivos
    }


  async kpiInformacionMonturasVip(informacionVentaDto:InformacionVentaDto, sucursal:string){
    const filtrador:FiltroVentaI={
      fecha:{
        $gte:new Date(informacionVentaDto.fechaInicio),
        $lte: new Date(informacionVentaDto.fechaFin)
      },
      sucursal:new Types.ObjectId(sucursal)
    
    }
  informacionVentaDto.tipoVenta.length> 0 ? filtrador.tipoVenta = {$in: informacionVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
    
    const monturasVip = await this.VentaExcelSchema.aggregate([
      {
        $match:{
          ...filtrador,
          importe:{$gt:700},
          producto:productos.montura
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
        $unwind:{path:'$marca',preserveNullAndEmptyArrays:false}
      },
    
      {
        $group:{
          _id:'$marca.nombre',
          cantidad:{$sum:'$cantidad'},
   
        }
      },
      {
        $group:{
          _id:null,
          monturas:{$sum:'$cantidad'},
          marcas:{$push:{
            marca:'$_id',
            cantidad:'$cantidad'

          }}
        }
      },
      
      {
        $project:{
          monturas:1,
          marcas:1
        }
      }


    ])
    return monturasVip[0]
  }
  
  async kpiMonturasPorEmpresa(kpiDto:KpiDto){

      const empresa = await this.empresaService.buscarEmpresa(kpiDto.empresa)
      if(empresa && empresa.nombre === 'OPTICENTRO'){

        return  this.kpiMonturasVipOpticentro(kpiDto)
      }else{
        return new NotFoundException()
      }

  }
  
  
  
   private  async kpiMonturasVipOpticentro(kpiDto:KpiDto){
    const filtrador:FiltroVentaI={
      fecha:{
        $gte:new Date(kpiDto.fechaInicio),
        $lte: new Date(kpiDto.FechaFin)
      }
      

    }
  
    
    kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in:kpiDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador

      const dataMonturasVip:any=[]
      for(let su of  kpiDto.sucursal){
        filtrador.sucursal = new Types.ObjectId(su)  
         const monturas = await this.VentaExcelSchema.aggregate([
          {
            $match:{
              ...filtrador,
              producto:productos.montura,
              importe:{$gt:700}
  
            },
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
              from:'suscursalexcels',
              foreignField:'_id',
              localField:'sucursal',
              as:'sucursal'
            }
          },
          
  
          {
            $unwind:{path:'$marca', preserveNullAndEmptyArrays:false}
          },
          {
            $unwind:{path:'$sucursal', preserveNullAndEmptyArrays:false}
          }
          ,
          {
            $group:{
              _id:null,
             cantidad:{$sum:'$cantidad'},
             sucursal:{$first:'$sucursal.nombre'},
             idSucursal:{$first:'$sucursal._id'}
            }
  
          },
        {
  
            $project:{
  
              _id:0,
              sucursal:1,
              cantidad:1,
              idSucursal:1
          
            }
          }
         ])
              
         dataMonturasVip.push(...monturas)
         
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
      kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: kpiDto.tipoVenta.map((id)=>new Types.ObjectId( id))} : filtrador
      for(let su of kpiDto.sucursal){
        const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))
        filtrador.sucursal= new Types.ObjectId(su)


        const dataKpi = await this.VentaExcelSchema.aggregate([
          {
            $match:{
              ...filtrador,
            // producto:productos.lente
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
            $unwind:{ path: '$tratamiento', preserveNullAndEmptyArrays: true }
          },
  
          {
            $unwind:{ path: '$marcaLente', preserveNullAndEmptyArrays: true }
          },
          {
            $unwind:{ path: '$tipoColor', preserveNullAndEmptyArrays: true }
          },
        
          {
            $unwind:{ path: '$tipoLente', preserveNullAndEmptyArrays: true }
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
                      {$eq:['$tratamiento.nombre','ANTIREFLEJO']}
                   
                    ]},
                    then:'$cantidad',
                    else:0
                  }
                }
              },
              tickets:{
                $sum:{
                  $cond:{
                    if:{$and:[
                      {$eq:['$aperturaTicket', '1']},
                      {$ne:['$producto', 'OTRO PRODUCTO']}
                      
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
                    {$eq:['$tipoLente.nombre','PROGRESIVO']},
                      /*{$eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']},
                      {$eq:['$marcaLente.nombre','DISEÑO DIGITAL']},
                      {$eq:['$marcaLente.nombre','DIGITAL PLATINIUM']},
                      {$eq:['$marcaLente.nombre','DIGITAL GOLD']},
                      {$eq:['$marcaLente.nombre','DIGITAL RUBY']},*/ // no se encontro en la base de datos
                    ]},
                    then:1,
                    else:0
                  }
                }
              
              },
              ocupacional:{
                $sum:{
                  $cond:{
                    if:{
                      $eq:['$tipoLente.nombre','OCUPACIONAL']
                     // $eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']
                    },
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
    
            
  
  
            }
          },
          {
            $project:{
              lentes:1,
              antireflejo:1,
              tickets:1,
              porcentajeAntireflejo: {
               $cond:{
                if:{$gt:['$lentes',0]},
                then:{
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
                else:0
               }
              
              },
              progresivos:1,
              ocupacional:1,
              progresivosOcupacionales: { $add: ['$progresivos', '$ocupacional'] },
              progresivosOcupacionalesPorcentaje: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
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
                  else:0
                }
              },
              porcentajeProgresivos: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
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
              else:0
            }
              
              },
              porcentajeOcupacionales: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
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
              else:0
            }
              
              },
              fotosensibles:1,
              procentajeFotosensibles:{
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
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
              else:0
            }
              },
           
              
                
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
  
 
  
  
      //---------------------------------------------------------  
  
  
      //-------------- kpi optiservice
  
      private async kpiOptiservice(kpiDto: KpiDto){
        const data:any[]=[]
        let filtrador:FiltroVentaI={
          fecha: {
            $gte: new Date(kpiDto.fechaInicio),
            $lte: new Date(kpiDto.FechaFin),
            
          },
        }

        kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: kpiDto.tipoVenta.map((id)=>new Types.ObjectId( id))} : filtrador
        for (let  su of kpiDto.sucursal ){
          const sucursal = await this.sucursalService.listarSucursalId(new Types.ObjectId(su))      
          filtrador.sucursal= new Types.ObjectId(su)  
   
          
          const dataKpi = await this.VentaExcelSchema.aggregate([
            {
              $match:{
                ...filtrador,
             
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
                from:'tipoventas',
                foreignField:'_id',
                localField:'tipoVenta',
                as:'tipoVenta'
              }
            },
            {
              $lookup:{
                from:'tipolentes',
                foreignField:'_id',
                localField:'tipoLente',
                as:'tipoLente'
              }
            },
            {
              $unwind:{ path: '$tipoLente', preserveNullAndEmptyArrays: true }
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
              $unwind:{ path: '$tipoVenta', preserveNullAndEmptyArrays: true }
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
              
                tickets: {
                  $sum: {
                    $cond: {
                      if:{$and:[
                        {$eq:['$aperturaTicket', '1']},
                        {$ne:['$producto', 'OTRO PRODUCTO']}
                      ]},
                      then: 1,
                      else: 0
                    }
                  }
                },
  
             
                antireflejo:{
                  $sum:{
                    $cond:{
                      if:{ $or:[
                    
                        {$eq:['$tratamiento.nombre','BLUE SHIELD']},
                        {$eq:['$tratamiento.nombre','GREEN SHIELD']},
                        {$eq:['$tratamiento.nombre','ANTIREFLEJO']}
                     
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
                        {$eq:['$tipoLente.nombre','PROGRESIVO']}
                       // {$eq:['$marcaLente.nombre','TALLADO  CONVENCIONAL']},
                        //{$eq:['$marcaLente.nombre','DISEÑO DIGITAL']},
                      ]},
                      then:'$cantidad',
                      else:0
                    }
                  }
                
                },
               
    
                fotoCromatico: {
                  $sum: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$tipoColor.nombre", "FOTOCROMATICO GRIS"] },   
                          { $eq: ["$tipoColor.nombre", "FOTOCROMATICO CAFE"] },
                          { $eq: ["$tipoColor.nombre", "FOTOCROMATICO"] },  
                          { $eq: ["$tipoColor.nombre", "SOLAR ACTIVE"] },  
                        ]
                      },
                      then: "$cantidad",
                      else: 0
                    }
                  }
                },
    
           
            
    
             
              }
            },
    
            {
              $project:{
                lentes:1,
                antireflejo:1,
                progresivos:1,
                fotoCromatico:1,
                tickets:1,
                //ventas:1,
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
            
           
                procentajeFotoCromatico:{
                  $round:[
                    {
                      $multiply:[
                        { $divide: ['$fotoCromatico','$lentes'] },
                        100
    
                      ]
                    }
                    ,2
                  ]
                },
            
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
 

  
  
  
     public async kpiMaterial(kpiDto:KpiDto){
      const data:any[]=[]
      const filtrador:FiltroVentaI={
        fecha:{
          $gte: new Date(kpiDto.fechaInicio),
          $lte: new Date(kpiDto.FechaFin)
        }
      }
      
      kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in: kpiDto.tipoVenta.map((id)=> new Types.ObjectId(id))}:filtrador
    
      for(let su of kpiDto.sucursal){

        filtrador.sucursal = new Types.ObjectId(su)      
        const kpiMaterial = await this.VentaExcelSchema.aggregate([
          {
            $match:{
              ...filtrador,
              producto:productos.lente
              
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
            $lookup:{
              from:'suscursalexcels',
              foreignField:'_id',
              localField:'sucursal',
              as:'sucursal'
            }
  
          },
          {
            $unwind:{path:'$material', preserveNullAndEmptyArrays:false}
          },
          {
            $unwind:{path:'$sucursal', preserveNullAndEmptyArrays:false}
          },
          {
            $group:{
              _id:'$material.nombre',
              cantidad:{$sum:'$cantidad'},
              sucursalNombre: { $first: '$sucursal.nombre' },
            }
          },
          
          {
            $group:{
              _id:null,
              lentes:{
                $sum:'$cantidad'
              },
              materiales:{
                $push:{
                  nombre:'$_id',
                  cantidad:'$cantidad',
             
                }
              },
              sucursalNombre: { $first: '$sucursalNombre' }, 
            }
          },
          {
            $project: {
              _id: 0,
              lentes: 1,
              sucursal: '$sucursalNombre',
              materiales:{
                $map:{
                  input:'$materiales',
                  as:'material',
                  in:{
                    nombre:'$$material.nombre',
                    cantidad:'$$material.cantidad',
                    porcentaje: {
                      $round:[
                        {
                          $multiply: [
                            { $divide: ['$$material.cantidad', '$lentes'] },
                            100
                          ]
                        },
                        2
                      ]
                    }
                    
                  }
                }
              }
              
         
            }
          }
        
      
        ])
       
        const resultado={
          kpiMaterial:kpiMaterial[0]
        }
        data.push(resultado)
  
      }
      return data
  
      }


     async kpiLentesDeContacto(kpiDto: KpiDto){
      const data : any[]=[]
        const filtrador : FiltroVentaI={
          fecha:{
            $gte:new Date(kpiDto.fechaInicio),
            $lte:new  Date(kpiDto.FechaFin)
          }
        }

        kpiDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in:kpiDto.tipoVenta.map((id)=> new Types.ObjectId(id)) }:filtrador
        for (let su of kpiDto.sucursal){
          filtrador.sucursal= new Types.ObjectId(su)
          const lc = await this.VentaExcelSchema.aggregate([
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
                  from:'suscursalexcels',
                  foreignField:'_id',
                  localField:'sucursal',
                  as:'sucursal'
                }
              },
              {
                $unwind:{path:'$marca', preserveNullAndEmptyArrays:true}
              },
              {
                $unwind:{path:'$sucursal', preserveNullAndEmptyArrays:true}
              },
              {
                $group:{
                  _id:null,
                  idSucursal:{$first:'$sucursal._id'},
                  sucursal:{$first:'$sucursal.nombre'},
                  cantidad:{$sum:'$cantidad'}
                }
              },
              {
                $project:{
                  _id:0,
                  idSucursal:1,
                  sucursal:1,
                  cantidad:1
                }
              }
          ]) 
           data.push(...lc)
        } 

        return data
        
     }

     async kpiIformacionLentesDeContacto ( informacionVentaDto: InformacionVentaDto, sucursal:string){
      
        const filtrador : FiltroVentaI={
          fecha:{
            $gte:new Date(informacionVentaDto.fechaInicio),
            $lte:new  Date(informacionVentaDto.fechaFin)
          },
          sucursal:new Types.ObjectId(sucursal)
        }
        informacionVentaDto.tipoVenta.length > 0 ? filtrador.tipoVenta = {$in:informacionVentaDto.tipoVenta.map((id)=> new Types.ObjectId(id)) }:filtrador

          const lc = await this.VentaExcelSchema.aggregate([
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
              },  
              {
                $group:{
                  _id:'$marca.nombre',
                  cantidad:{$sum:'$cantidad'}
                  
                }
              },
              
              {
                $group:{
                  _id:null,
                  lc:{$sum:'$cantidad'},
                  marcas:{ $push:{
                    marca:'$_id',
                    cantidad:'$cantidad',

                  }}
                }
              },
              
              {
                $project:{
                  _id:0,
                  marcas:1,
                  lc:1
                }
              }
              
          ]) 

          
          return lc[0]
          
        
     }


  

}
