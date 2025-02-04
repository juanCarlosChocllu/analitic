import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Oftalmologo } from './schemas/oftalmologo.schema';

import { Model, Types } from 'mongoose';

import { BuscarOftalmologoDto } from './dto/buscador-oftalmologo.dto';
import { especialidad } from 'src/venta/core/enums/especialidad.enum';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { log } from 'node:console';


@Injectable()
export class OftalmologoService {
  constructor(@InjectModel(Oftalmologo.name, NombreBdConexion.oc) private readonly oftalmologoSchema:Model<Oftalmologo>){}


  async findOneOftalmologo(nombreCompleto:string){    
    const oftalmologo = await this.oftalmologoSchema.exists({nombreCompleto})
    return oftalmologo
  }
  async crearOftalmologo(nombreCompleto:string, especialidad:string, sucursal:Types.ObjectId){
    const oftalmologo=  await this.oftalmologoSchema.create({nombreCompleto:nombreCompleto,especialidad,sucursal})
    return oftalmologo
  }

  async buscarOftalmologo( buscarOftalmologoDto: BuscarOftalmologoDto){;
    console.log(buscarOftalmologoDto);
    
    if(buscarOftalmologoDto.oftalmologo){
      const oftalmologo = await this.oftalmologoSchema.find({
        nombreCompleto:{$regex:buscarOftalmologoDto.oftalmologo, $options:'i'},
    
      }).select('nombreCompleto especialidad')
      return oftalmologo
    }

  }

/* async  KpiOftalMologo(ventaMedicosDto:VentaMedicosDto){
  
      if(ventaMedicosDto.oftalmologos.length > 0){
        return this.optalmologosRecetas(ventaMedicosDto)
      }else{
        return this.oftalmologoTodas(ventaMedicosDto)
      }
    
  }
  private async oftalmologoTodas(ventaMedicosDto:VentaMedicosDto){
    const dataMedicos:any[]=[]
    const oftalmologos = await this.oftalmologoSchema.find({especialidad:especialidad.OFTALMOLOGO})
    for(let o of oftalmologos){
      const data =  await this.oftalmologoSchema.aggregate([
        {
          $match:{
            _id:new Types.ObjectId(o._id),
           }
        },
        {
          $lookup:{
            from:'ventaexcels',
            foreignField:'oftalmologo',
            localField:'_id',
            as:'venta'
          }
        },  
        {
          $unwind:{ path:'$venta', preserveNullAndEmptyArrays:false}
        },
      
         {
          $lookup:{
            from:'suscursalexcels',
            foreignField:'_id',
            localField:'venta.sucursal',
            as:'sucursal'
          }
        },
        {
          $unwind:{ path:'$sucursal', preserveNullAndEmptyArrays:false}
        },
        {
          $match:{
            'venta.producto':productos.lente,
            'venta.fecha':{
              $gte:new Date(ventaMedicosDto.fechaInicio),
              $lte:new Date(ventaMedicosDto.fechaFin)
            }
          }
        },
        {
          $group:{
            _id:'$sucursal.nombre',
            sucursal:{$first:'$sucursal.nombre'},
            venta:{$sum:1},
            medico: { $first: '$nombreCompleto' }
          }
        },
        {
          $group:{
            _id:'$nombreCompleto',
            medico:{$first:'$medico'},
            data:{$push:
              {sucursal: '$sucursal',recetas: '$venta'}
            }
          }
        },
       {
          $project:{
            medico:1,
            data:1
          }      
       }
      ])      
      dataMedicos.push(...data)
    }
     return dataMedicos
  }

   private async optalmologosRecetas(ventaMedicosDto:VentaMedicosDto){
    const dataMedicos:any[]=[]
    for(let o of ventaMedicosDto.oftalmologos){
      const data =  await this.oftalmologoSchema.aggregate([
        {
          $match:{
            _id:new Types.ObjectId(o),
           }
        },
        {
          $lookup:{
            from:'ventaexcels',
            foreignField:'oftalmologo',
            localField:'_id',
            as:'venta'
          }
        },  
        {
          $unwind:{ path:'$venta', preserveNullAndEmptyArrays:false}
        },
      
         {
          $lookup:{
            from:'suscursalexcels',
            foreignField:'_id',
            localField:'venta.sucursal',
            as:'sucursal'
          }
        },
        {
          $unwind:{ path:'$sucursal', preserveNullAndEmptyArrays:false}
        },
        {
          $match:{
            'venta.producto':productos.lente,
            'venta.fecha':{
              $gte:new Date(ventaMedicosDto.fechaInicio),
              $lte:new Date(ventaMedicosDto.fechaFin)
            }
          }
        },
        {
          $group:{
            _id:'$sucursal.nombre',
            sucursal:{$first:'$sucursal.nombre'},
            venta:{$sum:1},
            medico: { $first: '$nombreCompleto' }
          }
        },
        {
          $group:{
            _id:'$nombreCompleto',
            medico:{$first:'$medico'},
            data:{$push:
              {sucursal: '$sucursal',recetas: '$venta'}
            }
          }
        },
       {
          $project:{
            medico:1,
            data:1
          }      
       }
      ])      
      dataMedicos.push(...data)
    }
     return dataMedicos
   }*/

}
