import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOftalmologoDto } from './dto/create-oftalmologo.dto';
import { UpdateOftalmologoDto } from './dto/update-oftalmologo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Oftalmologo } from './schemas/oftalmologo.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { Model, Types } from 'mongoose';
import { stat } from 'fs';

@Injectable()
export class OftalmologoService {
  constructor(@InjectModel(Oftalmologo.name, NombreBdConexion.oc) private readonly oftalmologoSchema:Model<Oftalmologo>){}
  create(createOftalmologoDto: CreateOftalmologoDto) {
    return 'This action adds a new oftalmologo';
  }

  findAll() {
    return `This action returns all oftalmologo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oftalmologo`;
  }

  update(id: number, updateOftalmologoDto: UpdateOftalmologoDto) {
    return `This action updates a #${id} oftalmologo`;
  }

  remove(id: number) {
    return `This action removes a #${id} oftalmologo`;
  }

  async findOneOftalmologo(nombreCompleto:string){    
    const oftalmologo = await this.oftalmologoSchema.exists({nombreCompleto})
    return oftalmologo
  }
  async crearOftalmologo(nombreCompleto:string, especialidad:string, sucursal:Types.ObjectId){
    const oftalmologo=  await this.oftalmologoSchema.create({nombreCompleto:nombreCompleto,especialidad,sucursal})
    return oftalmologo
  }

}
