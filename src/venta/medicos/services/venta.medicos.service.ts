import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Venta } from '../../schemas/venta.schema';
import { Model, Types } from 'mongoose';

import { VentaMedicosDto } from '../dto/venta.medicos.dto';

import { filtradorMedicos } from '../../core/util/filtro.medicos.util';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

import { CoreService } from 'src/venta/core/service/core.service';

import { resultadoRecetaI, VentaMedicoI } from '../interface/ventaMedicos';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { RecetaService } from 'src/receta/receta.service';
import { productos } from 'src/venta/core/enums/productos.enum';
import { Log } from 'src/log/schemas/log.schema';
import { BuscadorRecetaDto } from '../dto/BuscadorReceta.dto';
import { flagVenta } from 'src/venta/core/enums/flgaVenta.enum';
import { EstadoVentaE } from 'src/venta/core/enums/estado.enum';
import { tasaConversion } from 'src/venta/core/util/tasaConversion';

@Injectable()
export class VentaMedicosService {
  constructor(
    @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<Venta>,
    private readonly coreService: CoreService,
    private readonly sucursalService: SucursalService,
    private readonly recetasService: RecetaService,
  ) {}

  public async kpiMedicos(ventaMedicosDto: VentaMedicosDto) {
    const { especialidad, ...nuevoFiltro } = filtradorMedicos(ventaMedicosDto);
    const data: VentaMedicoI[] = [];

    try {
      for (const empresa of ventaMedicosDto.empresa) {
        let sucursalesEmpresa = await this.filtroSucursal(
          ventaMedicosDto,
          new Types.ObjectId(empresa),
        );

        for (let sucursal of sucursalesEmpresa) {
          const dataMedicos = await this.VentaExcelSchema.aggregate([
            {
              $match: {
                sucursal: new Types.ObjectId(sucursal._id),
                ...nuevoFiltro,

                ...(ventaMedicosDto.medico
                  ? { oftalmologo: new Types.ObjectId(ventaMedicosDto.medico) }
                  : {}),
              },
            },

            {
              $lookup: {
                from: 'Medico',
                foreignField: '_id',
                localField: 'medico',
                as: 'medico',
              },
            },
            {
              $unwind: { path: '$medico', preserveNullAndEmptyArrays: false },
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
                _id: '$medico.nombreCompleto',
                cantidad: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$producto', 'LENTE'] },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },

                lenteDeContacto: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$producto', 'LENTE DE CONTACTO'] },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },

                medico: { $first: '$medico._id' },
                e: { $first: '$medico.especialidad' },

                importe: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$producto', 'LENTE'] },
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
                cantidad: 1, //cantidad de ventas realizadas
                medico: 1,
                ventasLenteLc: { $add: ['$cantidad', '$lenteDeContacto'] }, //cantidad de ventas realizadas  + lente de contacto
                importe: 1,
                e: 1, //especialidad
              },
            },
          ]);
          const resultado: VentaMedicoI = {
            ventaLenteLc: dataMedicos.reduce(
              (acc, item) => acc + item.ventasLenteLc,
              0,
            ),
            sucursal: sucursal.nombre,
            totalRecetas: dataMedicos.reduce(
              (acc, item) => acc + item.cantidad,
              0,
            ),

            importe: dataMedicos.reduce((acc, item) => acc + item.importe, 0),

            idScursal: sucursal._id,
            data: dataMedicos,
          };
          data.push(resultado);
        }
      }

      return data;
    } catch (error) {
      return new BadRequestException();
    }
  }

  async filtroSucursal(
    ventaMedicosDto: VentaMedicosDto,
    empresa: Types.ObjectId,
  ) {
    const sucursal: SucursalI[] = [];
    if (ventaMedicosDto.empresa && ventaMedicosDto.sucursal.length <= 0) {
      const sucursales = await this.sucursalService.sucursalListaEmpresas(
        new Types.ObjectId(empresa),
      );
      sucursal.push(...this.clasificacionSucursal(sucursales));
    } else {
      const sucursalesEmpresa = await this.coreService.filtroSucursal(
        ventaMedicosDto.sucursal,
      );
      sucursal.push(...this.clasificacionSucursal(sucursalesEmpresa));
    }
    return sucursal;
  }
  private clasificacionSucursal(sucursalesEmpresa: SucursalI[]) {
    const sucursales: SucursalI[] = [];
    if (sucursalesEmpresa.length > 1) {
      for (const su of sucursalesEmpresa) {
        if (su.nombre !== 'OPTICENTRO PARAGUAY') {
          sucursales.push(su);
        }
      }
    } else if (sucursalesEmpresa.length == 1) {
      for (const su of sucursalesEmpresa) {
        if (su.nombre == 'OPTICENTRO PARAGUAY') {
          sucursales.push(su);
        } else {
          sucursales.push(su);
        }
      }
    }
    return sucursales;
  }

  async listarRecetasMedico(buscadorRecetaDto: BuscadorRecetaDto) {
    const recetasMedico =
      await this.recetasService.listarRecetaMedicos(buscadorRecetaDto);

    
    const data = await Promise.all(
      recetasMedico.map(async (item) => {
        const recetasMedico: resultadoRecetaI[] = [];
        for (const data of item.data) {  
          const ventas = await this.VentaExcelSchema.find(
            {
              numeroCotizacion: data.codigo,
              cotizacion: false,
              producto: productos.lente,
              estadoTracking:{$ne:'ANULADO'}
            },
            { numeroCotizacion: 1, numeroTicket: 1, producto: 1, flagVenta: 1 , fechaVenta:1},
          );

          if (ventas.length > 0) {
            for (const venta of ventas) {
              const receta: resultadoRecetaI = {
                idVenta: venta ? venta.numeroTicket : '',
                codigoReceta: data.codigo,
                flagVenta: venta ? venta.flagVenta : '',
                cantidad: venta ? 1 : 0,
                fechaVenta:venta.fechaVenta,
                fechaReceta:data.fecha

              };
              recetasMedico.push(receta);
            }
          } else {
            const receta: resultadoRecetaI = {
              idVenta: '',
              codigoReceta: data.codigo,
              flagVenta: '',
              cantidad: 0,
              fechaVenta:'',
              fechaReceta:data.fecha
            };
            recetasMedico.push(receta);
          }
        }
        const ventasRealizadas:number =recetasMedico.reduce(
            (acc, item) => item.cantidad + acc,
            0,
          )

         
        return {
          recetasMedico: recetasMedico,
          id: item.idMedico,
          medico: item.nombre,
          especialidad: item.especialidad,
          recetasRegistradas: item.recetas,
          ventasFinalizadas:  recetasMedico.filter((item)=> item.flagVenta ===  'FINALIZADO').length,
          ventasRealizadas: ventasRealizadas,
          tasaConversion:tasaConversion(ventasRealizadas, item.recetas)
        };
      }),
    );
    return data;
  }
}
