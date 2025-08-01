import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rango } from './schema/rango.schema';

import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Injectable()
export class RangosService {
    constructor (@InjectModel(Rango.name, NombreBdConexion.oc) private readonly rangoSchema:Model<Rango>){}

    public async guardarRango(rango:string){
        const rang = await this.rangoSchema.findOne({nombre:rango})
        if(!rang){
           return await this.rangoSchema.create({nombre:rango})
        }
        return rang

    }

 
    public async  listarRangos(rango:string){
        const rang = await this.rangoSchema.findOne({nombre:rango})
        return rang
    }

}
