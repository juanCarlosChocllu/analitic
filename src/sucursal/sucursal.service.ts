import { Injectable } from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sucursal } from './schema/sucursal.schema';
import { Model } from 'mongoose';
import { SucursalInterface } from './interfaces/sucursal.interface';
import { Flag } from './enums/flag.enum';

@Injectable()
export class SucursalService {
  constructor(@InjectModel(Sucursal.name) private  readonly SucursalScham : Model<Sucursal> ){}

  findAll(){
    const sucursal = this.SucursalScham.find({flag:Flag.nuevo}, 'nombre ciudad, flag').exec();
    return sucursal
  }


}
