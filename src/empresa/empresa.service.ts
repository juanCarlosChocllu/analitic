import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Empresa } from './schemas/empresa.schema';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectModel(Empresa.name, NombreBdConexion.mia)
    private readonly EmpresaSchema: Model<Empresa>,
  ) {}

  findAll() {
    return this.EmpresaSchema.find({}, 'nombre');
  }
}
