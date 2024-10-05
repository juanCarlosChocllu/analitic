import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TipoColor } from './schema/tipo-color.schema';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class TipoColorService {
    constructor(
        @InjectModel(TipoColor.name, NombreBdConexion.oc) private readonly tipoColorSchema:Model<TipoColor> ){}

        public async guardarTipoColor(tipoColor:string){
            const tColor= await this.tipoColorSchema.findOne({nombre:tipoColor})
            if(!tColor){
                await this.tipoColorSchema.create({nombre:tipoColor})

            }

        }

        public  async listarTipoColor(tipoColor:string){
            const tColor= await this.tipoColorSchema.findOne({nombre:tipoColor})
            return tColor
        }
}
