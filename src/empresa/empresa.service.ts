import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
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
  create(createEmpresaDto: CreateEmpresaDto) {
    return 'This action adds a new empresa';
  }

  findAll() {
    return this.EmpresaSchema.find({}, 'nombre');
  }
}
