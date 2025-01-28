import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tratamiento } from './schema/tratamiento.schema';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Injectable()
export class TratamientoService {
  constructor(
    @InjectModel(Tratamiento.name, NombreBdConexion.oc)
    private readonly TratamientoSchema: Model<Tratamiento>,
  ) {}

  public async guardarTratamiento(tratamiento: string) {
    const trata = await this.TratamientoSchema.findOne({ nombre: tratamiento });
    if (!trata) {
      await this.TratamientoSchema.create({ nombre: tratamiento });
    }
  }

  public async listarTratamiento(tratamiento: string) {
    const trata = await this.TratamientoSchema.findOne({ nombre: tratamiento });
    return trata;
  }
}
