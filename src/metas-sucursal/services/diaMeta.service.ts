import { Injectable } from "@nestjs/common";
import { DiasMetasSucursal } from "../schema/diasMetaSucursal.schema";
import { NombreBdConexion } from "src/core/enums/nombre.db.enum";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class DiasMetaService {
        constructor (
                @InjectModel(DiasMetasSucursal.name, NombreBdConexion.oc)
                private readonly diasMetasSucursal: Model<DiasMetasSucursal>,
        ){}


    async  metasDias (f1:Date, f2:Date, meta:Types.ObjectId ){
        const dias = await this.diasMetasSucursal.find({metasSucursal:meta , metaDia:{ $gte: f1 , $lte: f2} })
        return dias
    }

    async  create (dia:Date, meta:Types.ObjectId ){
       await  this.diasMetasSucursal.create({metasSucursal:meta, metaDia:dia})
        return 
    }
}