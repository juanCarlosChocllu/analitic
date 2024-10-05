import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rango } from './schema/rango.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { Model } from 'mongoose';

@Injectable()
export class RangosService {
    constructor (@InjectModel(Rango.name, NombreBdConexion.oc) private readonly rangoSchema:Model<Rango>){}

    public async guardarRangos(rango:string){
        const rang = await this.rangoSchema.findOne({nombre:rango})
        if(!rang){
            await this.rangoSchema.create({nombre:rango})
        }

    }

 
    public async  listarRangos(rango:string){
        const rang = await this.rangoSchema.findOne({nombre:rango})
        return rang
    }

}
