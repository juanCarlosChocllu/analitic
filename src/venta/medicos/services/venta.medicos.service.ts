import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Venta } from '../../schemas/venta.schema';
import { Model, Types } from 'mongoose';
import { SucursalService } from 'src/sucursal/sucursal.service';

import { VentaMedicosDto } from '../../dto/venta.medicos.dto';
import { OftalmologoService } from 'src/oftalmologo/oftalmologo.service';
import { filtradorMedicos } from '../../core/util/filtro.medicos.util';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { CoreService } from 'src/venta/core/service/core.service';

@Injectable()
export class VentaMedicosService {
  constructor(
    @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<Venta>,
    private readonly coreService:CoreService
  ) {}

  public async kpiMedicos(ventaMedicosDto: VentaMedicosDto) {
    const { especialidad, ...nuevoFiltro } = filtradorMedicos(ventaMedicosDto);
    const data: any[] = [];

        try {
            const sucursales = await this.coreService.filtroSucursal(ventaMedicosDto.sucursal);
            for (let sucursal of sucursales) {
              const dataMedicos = await this.VentaExcelSchema.aggregate([
                {
                  $match: {
                    sucursal: new Types.ObjectId(sucursal._id),
                    ...nuevoFiltro,
                  },
                },
        
                {
                  $lookup: {
                    from: 'Oftalmologo',
                    foreignField: '_id',
                    localField: 'oftalmologo',
                    as: 'oftalmologo',
                  },
                },
                {
                  $unwind: { path: '$oftalmologo', preserveNullAndEmptyArrays: false },
                },
                ...(especialidad
                  ? [
                      {
                        $match: {
                          'oftalmologo.especialidad': especialidad,
                        },
                      },
                    ]
                  : []),
        
                {
                  $group: {
                    _id: '$oftalmologo.nombreCompleto',
                    cantidad: {
                      $sum: {
                        $cond: {
                          if: { $eq: ['$producto', 'LENTE'] },
                          then: '$cantidad',
                          else: 0,
                        },
                      },
                    },
        
                    medico: { $first: '$oftalmologo._id' },
                    e: { $first: '$oftalmologo.especialidad' },
                    lenteContacto: {
                      $sum: {
                        $cond: {
                          if: { $eq: ['$producto', 'LENTE DE CONTACTO'] },
                          then: '$cantidad',
                          else: 0,
                        },
                      },
                    },
        
                    importe: {
                      $sum: {
                        $cond: {
                          if: { $eq: ['$aperturaTicket', '1'] },
                          then: '$importe',
                          else: 0,
                        },
                      },
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    nombre: '$_id',
                    cantidad: 1,
                    medico: 1,
                    ventas: {
                      $sum: ['$lenteContacto', '$cantidad'],
                    },
                    importe: 1,
                    e: 1, //especialidad
                  },
                },
              ]);
        
              const resultado = {
                sucursal: sucursal.nombre,
                totalRecetas: dataMedicos.reduce((acc, item) => acc + item.cantidad, 0),
                ventas: dataMedicos.reduce((acc, item) => acc + item.ventas, 0),
                importe: dataMedicos.reduce((acc, item) => acc + item.importe, 0),
                idScursal: sucursal._id,
                data: dataMedicos,
              };
              data.push(resultado);
            }
        
            return data;
        } catch (error) {
            return new BadRequestException()
        }   
  }

 
}
