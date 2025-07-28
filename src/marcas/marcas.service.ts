import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Marca } from './schema/marca.schema';

import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Injectable()
export class MarcasService {
    constructor (@InjectModel(Marca.name, NombreBdConexion.oc) private readonly marcaSchema:Model<Marca>){}
    public async guardarMarcaProducto(nombre:string){
        const marca = await this.marcaSchema.exists({nombre:nombre})
        if(!marca){
            return this.marcaSchema.create({nombre:nombre})
        }
        return marca
    }

    public async listarMarcaProducto(nombre:string){
        const marca = await this.marcaSchema.findOne({nombre:nombre})
        return marca
    }

}


