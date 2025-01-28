import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Material } from './schema/material.schema';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Injectable()
export class MaterialService {

  constructor ( @InjectModel(Material.name, NombreBdConexion.oc)  private  readonly materialSchema:Model<Material>){

  }
  public async guardarMaterIal(material:string){
   const mate = await this.materialSchema.findOne({nombre:material})
   if(!mate){
    await this.materialSchema.create({nombre:material})
   } 
 }

 public async listarMaterial(material:string){
  const mate = await this.materialSchema.findOne({nombre:material})
  return mate
 }


}
