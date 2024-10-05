import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TipoLente } from './schema/tipo-lente.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { Model } from 'mongoose';

@Injectable()
export class TipoLenteService {
  constructor(
    @InjectModel(TipoLente.name, NombreBdConexion.oc)
    private readonly TipoLenteSchema: Model<TipoLente>,
  ) {}
  public async guardarTipoLente(nombre: string) {
    const tipoLent = await this.TipoLenteSchema.findOne({ nombre: nombre });
    if (!tipoLent) {
      await this.TipoLenteSchema.create({ nombre: nombre });
    }
  }


  public async listarTipoLente(nombre:string){
    const tipoLente = await this.TipoLenteSchema.findOne({ nombre: nombre });
    return tipoLente
  }
}
