import { Injectable } from '@nestjs/common';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { Medico } from './schema/medico.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BuscadorMedicoDto } from './dto/BuscadorMedico.dto';

@Injectable()
export class MedicoService {
  constructor(
    @InjectModel(Medico.name, NombreBdConexion.oc)
    private readonly medico: Model<Medico>,
  ) {}

  async buscarMedico(nombreCompleto: string) {
    const medico = await this.medico.exists({ nombreCompleto });
    return medico;
  }
  async crearMedico(nombreCompleto: string, especialidad: string) {
    const medico = await this.medico.exists({
      nombreCompleto: nombreCompleto,
      especialidad,
    });
    if (!medico) {
      return this.medico.create({
        nombreCompleto: nombreCompleto,
        especialidad,
      });
    }
    return medico;
  }

  async buscarOftalmologo(buscarOftalmologoDto: BuscadorMedicoDto) {
    if (buscarOftalmologoDto.oftalmologo) {
      const medico = await this.medico
        .find({
          nombreCompleto: {
            $regex: buscarOftalmologoDto.oftalmologo,
            $options: 'i',
          },
        })
        .select('nombreCompleto especialidad');
      return medico;
    }
  }

  async verificarMedico(nombreCompleto: string, especialidad: string) {
    const medico = await this.medico.exists({
      nombreCompleto: nombreCompleto,
      especialidad,
    });
    if (!medico) {
      return await this.medico.create({
        nombreCompleto: nombreCompleto,
        especialidad: especialidad,
      });
    }
    return medico;
  }
}
