import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Empresa } from './schemas/empresa.schema';
import { Model } from 'mongoose';

@Injectable()
export class EmpresaService {

  constructor(@InjectModel(Empresa.name) private readonly EmpresaSchema:Model<Empresa> ){}
  create(createEmpresaDto: CreateEmpresaDto) {
    return 'This action adds a new empresa';
  }

  findAll() {
    return this.EmpresaSchema.find({},'nombre') ;
  }

  async findOne(id: string) {
    const empresa = await  this.EmpresaSchema.findById(id).select('_id');
    if(!empresa){
        throw new NotFoundException('Empresa no encontrada')
    }
    return empresa
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    return `This action updates a #${id} empresa`;
  }

  remove(id: number) {
    return `This action removes a #${id} empresa`;
  }
}
