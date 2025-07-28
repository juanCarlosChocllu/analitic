import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TipoLente } from './schema/tipo-lente.schema';

import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Injectable()
export class TipoLenteService {
  constructor(
    @InjectModel(TipoLente.name, NombreBdConexion.oc)
    private readonly TipoLenteSchema: Model<TipoLente>,
  ) {}
  public async guardarTipoLente(nombre: string) {
    const tipoLent = await this.TipoLenteSchema.findOne({ nombre: nombre });
    if (!tipoLent) {
      return this.TipoLenteSchema.create({ nombre: nombre });
    }
    return tipoLent
  }


  public async listarTipoLente(nombre:string){
    const tipoLente = await this.TipoLenteSchema.findOne({ nombre: nombre });
    return tipoLente
  }
}
