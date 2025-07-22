import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Venta } from '../../schemas/venta.schema';
import { Model, Types } from 'mongoose';
import { detallleVentaFilter } from '../../core/util/detalleVentaFilter.util';
import { InformacionVentaDto } from '../../core/dto/informacion.venta.dto';
import { productos } from '../../core/enums/productos.enum';
import { filtradorVenta } from '../../core/util/filtrador.venta.util';

import { SucursalService } from 'src/sucursal/sucursal.service';
import { EmpresaService } from 'src/empresa/empresa.service';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { VentaDto} from 'src/venta/core/dto/venta.dto';

@Injectable()
export class VentaProductosService {
    constructor(     
           @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<Venta>,
    private readonly empresaService: EmpresaService,
    private readonly sucursalService: SucursalService,

){
    }
    async kpiLentesDeContacto(kpiDto: VentaDto){
        const filtrador = filtradorVenta(kpiDto)
        const data : any[]=[]
        
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
                    from:'Marca',
                    foreignField:'_id',
                    localField:'marca',
                    as:'marca'
                  }
                },
                {
                  $lookup:{
                    from:'Sucursal',
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
  
       async kpiIformacionLentesDeContacto ( informacionVentaDto: InformacionVentaDto, sucursal:Types.ObjectId){
         const filtrador = detallleVentaFilter(sucursal, informacionVentaDto)
            const lc = await this.VentaExcelSchema.aggregate([
                {
                  $match:{
                    ...filtrador,
                    producto:productos.lenteDeContacto
                  }
                },
                {
                  $lookup:{
                    from:'Marca',
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
  
  
      async kpiMonturas(kpiDto:VentaDto){
  
        const filtrador = filtradorVenta(kpiDto)
  
          const dataMonturas:any=[]
          for(let su of  kpiDto.sucursal){
            filtrador.sucursal = new Types.ObjectId(su)  
             const monturas = await this.VentaExcelSchema.aggregate([
              {
                $match:{
                  ...filtrador,
                  producto:productos.montura,
                 
                },
              },
              {
                $lookup:{
                  from:'Marca',
                  foreignField:'_id',
                  localField:'marca',
                  as:'marca'
                }
              },
      
              {
                $lookup:{
                  from:'Sucursal',
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
             dataMonturas.push(...monturas)
             
          }
          return dataMonturas
      
        }
  
        async kpiInformacionMonturas(informacionVentaDto:InformacionVentaDto, sucursal:Types.ObjectId){
          const filtrador = detallleVentaFilter(sucursal, informacionVentaDto)
          const monturas = await this.VentaExcelSchema.aggregate([
            {
              $match:{
                ...filtrador,
                producto:productos.montura
              }
            },
            {
              $lookup:{
                from:'Marca',
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
          return monturas[0]
        }
  
  
        
      async kpiGafas(kpiDto:VentaDto){
         const filtrador = filtradorVenta(kpiDto)
          const dataGafa:any=[]
          for(let su of  kpiDto.sucursal){
            filtrador.sucursal = new Types.ObjectId(su)  
             const gafa = await this.VentaExcelSchema.aggregate([
              {
                $match:{
                  ...filtrador,
                  producto:productos.gafa,
                 
                },
              },
              {
                $lookup:{
                  from:'Marca',
                  foreignField:'_id',
                  localField:'marca',
                  as:'marca'
                }
              },
      
              {
                $lookup:{
                  from:'Sucursal',
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
             dataGafa.push(...gafa)
             
          }
          return dataGafa
      
        }
  
        async kpiInformacionGafa(informacionVentaDto:InformacionVentaDto, sucursal:Types.ObjectId){
          const filtrador = detallleVentaFilter(sucursal, informacionVentaDto)
          const gafa = await this.VentaExcelSchema.aggregate([
            {
              $match:{
                ...filtrador,
                producto:productos.gafa
              }
            },
            {
              $lookup:{
                from:'Marca',
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
                gafas:{$sum:'$cantidad'},
                marcas:{$push:{
                  marca:'$_id',
                  cantidad:'$cantidad'
      
                }}
              }
            },
            
            {
              $project:{
                gafas:1,
                marcas:1
              }
            }
          ])
          return gafa[0]
        }
  
  

        async kpiMonturasPorEmpresa(kpiDto:VentaDto){

            const empresa = await this.empresaService.buscarEmpresa(kpiDto.empresa)
            if(empresa && empresa.nombre === 'OPTICENTRO'){
      
              return  this.kpiMonturasVipOpticentro(kpiDto)
            }else{
              return new NotFoundException()
            }
      
        }
        
        
        
         private  async kpiMonturasVipOpticentro(kpiDto:VentaDto){
          const filtrador = filtradorVenta(kpiDto)
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
                    from:'Marca',
                    foreignField:'_id',
                    localField:'marca',
                    as:'marca'
                  }
                },
        
                {
                  $lookup:{
                    from:'Sucursal',
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

          async kpiInformacionMonturasVip(informacionVentaDto:InformacionVentaDto, sucursal:Types.ObjectId){
            const filtrador = detallleVentaFilter(sucursal, informacionVentaDto)
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
                  from:'Marca',
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
          

}
