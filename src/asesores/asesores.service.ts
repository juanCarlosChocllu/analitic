import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asesor } from './schemas/asesore.schema';
import { Model, Types } from 'mongoose';

import { AsesorExcelI } from 'src/venta/core/interfaces/asesor.interface';

import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { AsesorEmpresaSucursalI } from './interface/asesorEmpresaSucursal';

@Injectable()
export class AsesoresService {
  constructor(
       
    @InjectModel(Asesor.name, NombreBdConexion.oc)
    
    private readonly asesor: Model<Asesor>,
  ){}

  async asesorFindOne(asesor:Types.ObjectId){
   const a= await  this.asesor.findOne({ _id: asesor,}).select('usuario');
    return a
    } 

  async listarAsesorPorSucursal(sucursal:Types.ObjectId):Promise<AsesorExcelI[]>{
    const asesores:AsesorExcelI[] =await this.asesor.find({
      sucursal: new Types.ObjectId(sucursal),
    });
    
    return asesores
  }

  async  buscarAsesorPorScursal (asesor:string ,sucursal:Types.ObjectId ){
    const a = await this.asesor.findOne({
      usuario: asesor.toUpperCase().trim(),
      sucursal: sucursal._id,
    })
    return a
   } 

   async  crearAsesor (asesor:string ,sucursal:Types.ObjectId ){
     
   const a = await this.asesor.exists({
      usuario: asesor.toUpperCase().trim(),
      sucursal: sucursal._id,
    })
    if(!a){
      return this.asesor.create({
      usuario: asesor.toUpperCase().trim(),
      sucursal: sucursal._id,
    })
    }
    return a
   
   } 

   async asesorSucursalEmpresa(sucursal:Types.ObjectId):Promise<AsesorEmpresaSucursalI[]>{
      const asesor:AsesorEmpresaSucursalI[] = await this.asesor.aggregate([
        {
          $match:{
            sucursal:new Types.ObjectId(sucursal) 
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
          $unwind:'$sucursal'
        },
        {
          $lookup:{
            from:'Empresa',
            foreignField:'_id',
            localField:'sucursal.empresa',
            as:'empresa'
          }
        },
        {
          $unwind:'$empresa'
        },
        {
          $project:{
            sucursal:'$sucursal._id',
            nombreSucursal:'$sucursal.nombre',
            asesor:'$_id',
            nombreAsesor:'$usuario',
            nombreEmpresa:'$empresa.nombre'
          }
        }

      ])
    return asesor
   }

  
   

}
