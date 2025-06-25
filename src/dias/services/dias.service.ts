import { BadRequestException, forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { CreateDiaDto } from '../dto/create-dia.dto';
import { Dia } from '../schema/dia.schema';
import { UpdateDiaDto } from '../dto/update-dia.dto';
import { NombreDiaService } from './nombreDia.service';

import { Flag } from 'src/core/enums/flag';


import { DiaEstadoE } from '../enums/diaEstado';

@Injectable()
export class DiasService {
  constructor(@InjectModel(Dia.name,NombreBdConexion.oc) private readonly dia:Model<Dia>,
  @Inject(forwardRef(() => NombreDiaService)) private readonly nombreDiaService: NombreDiaService

){}
  async create(createDiaDto: CreateDiaDto) {
   try {
    const nombreDia = await this.nombreDiaService.crearNombreDia(createDiaDto.nombre, createDiaDto.tipo)
      
      
    for (const data of createDiaDto.data) {
      data.sucursal = new Types.ObjectId(data.sucursal)
      await this.dia.create({
        sucursal:data.sucursal,
        dia:data.dia,
        nombreDia:new Types.ObjectId(nombreDia._id),
        estado:data.estado
      
      })

}
 return {status:HttpStatus.CREATED}
      
   } catch (error) {
      throw new BadRequestException()
   }
  }
  findAll() {
    return `This action returns all dias`;
  }

  async listarDiasHabiles(dia:Date, sucursal:Types.ObjectId){
    dia.setUTCHours(0,0,0,0)
  
      
    const dias =await this.dia.findOne({dia:dia, sucursal:new Types.ObjectId(sucursal), flag:Flag.nuevo,estado:DiaEstadoE.habil})

    
    return dias
  }

  async listarDiasInhabiles(dia:Date, sucursal:Types.ObjectId){
    dia.setUTCHours(0,0,0,0)
  
    
    const dias =await this.dia.findOne({dia:dia, sucursal:new Types.ObjectId(sucursal), flag:Flag.nuevo, estado:DiaEstadoE.inhabil})

    
    return dias
  }

  async listarDias(nombreDia: Types.ObjectId) {
    const dias = await this.dia.aggregate([
      {
        $match:{nombreDia:new Types.ObjectId(nombreDia),
           flag:Flag.nuevo}
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
        $unwind:'$sucursal'
      },
      {
        $lookup:{
          from:'NombreDia',
          foreignField:'_id',
          localField:'nombreDia',
          as:'nombreDia'
        }
      },
      {
        $unwind:'$nombreDia'
      },
      {
        $project:{
          sucursal:'$sucursal.nombre',
          tipo:'$nombreDia.tipo',
          estado:1, 
          dia: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: '$dia'
            }
          }
        }
      }

    ])
    console.log(dias);
    
    return dias 
    
  }

  update(id: number, updateDiaDto: UpdateDiaDto) {
    return `This action updates a #${id} dia`;
  }

  async remove(dia: Types.ObjectId) {
    const d = await this.dia.findOne({_id:new Types.ObjectId(dia), flag:Flag.nuevo})
    if(!d){
      throw new NotFoundException()
    }
   await this.dia.updateOne({_id:new Types.ObjectId(dia)}, {flag:Flag.eliminado})
 
    
    return  {status :HttpStatus.OK};
  }


  async borrarTodoDia(nombreDia:Types.ObjectId){
      await this.dia.updateMany({nombreDia:new Types.ObjectId(nombreDia)}, {flag:Flag.eliminado})
      return
  }
}
