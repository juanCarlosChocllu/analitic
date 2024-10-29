import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MarcaLente } from './schema/marca-lente.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { Model } from 'mongoose';

@Injectable()
export class MarcaLenteService {
  constructor (@InjectModel(MarcaLente.name, NombreBdConexion.oc) private readonly marcaLenteSchema:Model<MarcaLente>){}

  public async guardarMarcaLente(nombre:string){
      const marcaLente = await this.marcaLenteSchema.findOne({nombre:nombre})
      if(!marcaLente){
          await this.marcaLenteSchema.create({nombre:nombre})
      }

  }

  public async listarMarcaLente(nombre:string){
      const marcaLente = await this.marcaLenteSchema.findOne({nombre:nombre})
      return marcaLente
  }


}