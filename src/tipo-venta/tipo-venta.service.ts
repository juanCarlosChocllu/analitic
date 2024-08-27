import { Injectable } from '@nestjs/common';
import { CreateTipoVentaDto } from './dto/create-tipo-venta.dto';
import { UpdateTipoVentaDto } from './dto/update-tipo-venta.dto';
import { TipoVenta } from './schemas/tipo-venta.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class TipoVentaService {
  constructor(@InjectModel(TipoVenta.name,NombreBdConexion.mia) private  readonly  TipoVentaSchema:Model<TipoVenta>){}

  findAll() {
    return this.TipoVentaSchema.find({},'nombre').exec();
  }

}
