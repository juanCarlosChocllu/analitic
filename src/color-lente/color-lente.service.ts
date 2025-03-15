import { Injectable } from '@nestjs/common';
import { CreateColorLenteDto } from './dto/create-color-lente.dto';
import { UpdateColorLenteDto } from './dto/update-color-lente.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ColorLente } from './schema/colorLente.schema';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Injectable()
export class ColorLenteService {
  constructor( @InjectModel(ColorLente.name, NombreBdConexion.oc) private readonly colorLente:Model<ColorLente>){}
  create(createColorLenteDto: CreateColorLenteDto) {
    return 'This action adds a new colorLente';
  }

  findAll() {
    return `This action returns all colorLente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} colorLente`;
  }

  update(id: number, updateColorLenteDto: UpdateColorLenteDto) {
    return `This action updates a #${id} colorLente`;
  }

  remove(id: number) {
    return `This action removes a #${id} colorLente`;
  }

  public async guardarColorLente(colorLente: string) {
    const trata = await this.colorLente.findOne({ nombre: colorLente });
    if (!trata) {
      await this.colorLente.create({ nombre: colorLente });
    }
  }

  public async listarColorLente(colorLente: string) {
    const trata = await this.colorLente.findOne({ nombre: colorLente });
    return trata;
  }
}
