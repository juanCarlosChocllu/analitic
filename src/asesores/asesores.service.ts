import { Injectable } from '@nestjs/common';
import { CreateAsesoreDto } from './dto/create-asesore.dto';
import { UpdateAsesoreDto } from './dto/update-asesore.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Asesor } from './schemas/asesore.schema';
import { Model, Types } from 'mongoose';

import { AsesorExcelI } from 'src/venta/core/interfaces/asesor.interface';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

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
      await this.asesor.create({
      usuario: asesor.toUpperCase().trim(),
      sucursal: sucursal._id,
    })
   
   } 
}
