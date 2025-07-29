import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Receta } from './schema/receta.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { Model } from 'mongoose';
import { RecetaI, RecetaMedicoI } from './interface/receta';

import { BuscadorRecetaDto } from 'src/venta/medicos/dto/BuscadorReceta.dto';

@Injectable()
export class RecetaService {
  @InjectModel(Receta.name, NombreBdConexion.oc)
  private readonly receta: Model<Receta>;

  public async buscarReceta(codigoMia: string) {
    const receta = await this.receta.exists({ codigoMia: codigoMia });
    return receta;
  }

  public async registrarReceta(data: RecetaI) {
   return  await this.receta.create(data);
  
  }

  public async listarRecetaMedicos(
    buscadorRecetaDto: BuscadorRecetaDto,
  ): Promise<RecetaMedicoI[]> {
    const recetas = await this.receta.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(
              new Date(buscadorRecetaDto.fechaInicio).setUTCHours(0, 0, 0, 0),
            ),
            $lte: new Date(
              new Date(buscadorRecetaDto.fechaFin).setUTCHours(23, 59, 59, 999),
            ),
          },
        },
      },
      {
        $match:{
          'codigoReceta':{$ne:''}
        }
      },
      {
        $lookup: {
          from: 'Medico',
          foreignField: '_id',
          localField: 'medico',
          as: 'medico',
        },
      },
      {
        $unwind: { path: '$medico', preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: {
            nombre: '$medico.nombreCompleto',
            especialidad: '$medico.especialidad',
          },
          data: { $push: {codigo:'$codigoReceta' , fecha:'$fecha'} },
          recetas: { $sum: 1 },
          idMedico: { $first: '$medico._id' },
        },
      },
      {
        $project: {
          _id:0,
          idMedico: 1,
          nombre: '$_id.nombre',
          especialidad: '$_id.especialidad',
          data: 1,
          recetas: 1,
          fecha:1,
        },
      },
    ]);
    return recetas;
  }
}
