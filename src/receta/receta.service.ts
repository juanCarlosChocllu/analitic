import { Injectable } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Receta } from './schema/receta.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { Model } from 'mongoose';
import { RecetaI } from './interface/receta';

@Injectable()
export class RecetaService {
      @InjectModel(Receta.name, NombreBdConexion.oc)
      private readonly receta: Model<Receta>
  
    public async buscarReceta(codigoMia:string){
      const receta = await this.receta.exists({codigoMia:codigoMia})
      return receta
    }

     public async registrarReceta(data:RecetaI){
      await this.receta.create(data)
      return
     }
}
