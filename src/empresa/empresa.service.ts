import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { EmpresaExcel} from './schemas/empresa.schema';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Injectable()
export class EmpresaService {
  constructor(
    @InjectModel(EmpresaExcel.name, NombreBdConexion.oc)
    private readonly EmpresaSchema: Model<EmpresaExcel>,
  ) {}


  async EmpresaExcel() {
    const empresas = await this.EmpresaSchema.find();
    return empresas;
  }

  async buscarEmpresa(id:string){
    const empresa=  await this.EmpresaSchema.findById(id)
    return empresa
  }


}
