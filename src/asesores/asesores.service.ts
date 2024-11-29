import { Injectable } from '@nestjs/common';
import { CreateAsesoreDto } from './dto/create-asesore.dto';
import { UpdateAsesoreDto } from './dto/update-asesore.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AsesorExcel } from './schemas/asesore.schema';
import { Model, Types } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { AsesorExcelI } from 'src/venta/interfaces/asesor.interface';

@Injectable()
export class AsesoresService {
  constructor(
       
    @InjectModel(AsesorExcel.name, NombreBdConexion.oc)
    
    private readonly AsesorExcelSchema: Model<AsesorExcel>,
  ){}

  async asesorFindOne(asesor:Types.ObjectId){
   const a= await  this.AsesorExcelSchema.findOne({ _id: asesor,}).select('usuario');
    return a
    } 

  async listarAsesorPorSucursal(sucursal:Types.ObjectId):Promise<AsesorExcelI[]>{
    const asesores:AsesorExcelI[] =await this.AsesorExcelSchema.find({
      sucursal: new Types.ObjectId(sucursal),
    });
    return asesores
  }

  async  buscarAsesorPorScursal (asesor:string ,sucursal:Types.ObjectId ){
    const a = await this.AsesorExcelSchema.findOne({
      usuario: asesor.toUpperCase().trim(),
      sucursal: sucursal._id,
    })
    return a
   } 

   async  crearAsesor (asesor:string ,sucursal:Types.ObjectId ){
      await this.AsesorExcelSchema.create({
      usuario: asesor.toUpperCase().trim(),
      sucursal: sucursal._id,
    })
   
   } 
}
