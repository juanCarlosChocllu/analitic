import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Venta } from '../../schemas/venta.schema';

import { Model, Types } from 'mongoose';
import { EmpresaService } from 'src/empresa/empresa.service';

import { FiltroVentaI } from '../../core/interfaces/filtro.venta.interface';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { productos } from '../../core/enums/productos.enum';

import { InformacionVentaDto } from '../../core/dto/informacion.venta.dto';

import { filtradorVenta } from '../../core/util/filtrador.venta.util';
import { detallleVentaFilter } from '../../core/util/detalleVentaFilter.util';
import { VentaTodasDto } from '../../core/dto/venta.todas.dto';
import { filtradorKpiInformacionEmpresa } from '../../core/util/filtrador.kpi.informacion.empresa.util';
import { DetalleVentaFilter } from '../../core/dto/informacion.empresas.todas.dto';
import { filtradorKpiInformacionTodasEmpresas } from '../../core/util/filtrador.infomacion.todas.empresas.util';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { VentaDto } from 'src/venta/core/dto/venta.dto';
import { AsesoresService } from 'src/asesores/asesores.service';
import { EmpresaE } from 'src/venta/core/enums/empresa.enum';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { filtroInformacionAsesor } from 'src/venta/core/util/filtardorInformacionPorAsesor';

@Injectable()
export class VentaLenteService {
  constructor(
    @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<Venta>,
    private readonly empresaService: EmpresaService,
    private readonly sucursalService: SucursalService,
    private readonly asesorService: AsesoresService,
  ) {}

  async kpiInformacionTodasEmpresas(
    informacionEmpresasTodasVentaDto: DetalleVentaFilter,
  ) {
    const filtrador = filtradorKpiInformacionTodasEmpresas(
      informacionEmpresasTodasVentaDto,
    );
    console.log(filtrador);
    
    const [antireflejo, progresivos, ocupacional] = await Promise.all([
      this.kpiAntireflejo(filtrador),
      this.kpiProgresivos(filtrador),
      this.kpiOcupacional(filtrador),
    ]);
    return { antireflejo, progresivos, ocupacional };
  }

  async kpiInformacionEmpresa(
    empresa: string,
    informacionVentaDto: InformacionVentaDto,
  ) {
    const filtrador = filtradorKpiInformacionEmpresa(
      empresa,
      informacionVentaDto,
    );
    const [antireflejo, progresivos, ocupacional, en] = await Promise.all([
      this.kpiAntireflejo(filtrador),
      this.kpiProgresivos(filtrador),
      this.kpiOcupacional(filtrador),
      this.empresaService.buscarEmpresa(empresa),
    ]);
    return { antireflejo, progresivos, ocupacional, empresa: en.nombre };
  }

  async kpiInformacion(
    sucursal: Types.ObjectId,
    informacionVentaDto: InformacionVentaDto,
  ) {
    const filtrador = detallleVentaFilter(sucursal, informacionVentaDto);
    const [antireflejo, progresivos, ocupacional, su] = await Promise.all([
      this.kpiAntireflejo(filtrador),
      this.kpiProgresivos(filtrador),
      this.kpiOcupacional(filtrador),
      this.sucursalService.listarSucursalId(new Types.ObjectId(sucursal)),
    ]);

    return { antireflejo, progresivos, ocupacional, sucursal: su.nombre };
  }

  private async kpiAntireflejo(filtrador: FiltroVentaI) {
    const antireflejo = await this.VentaExcelSchema.aggregate([
      {
        $match: filtrador,
      },
      {
        $lookup: {
          from: 'Tratamiento',
          foreignField: '_id',
          localField: 'tratamiento',
          as: 'tratamiento',
        },
      },

      {
        $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: false },
      },

      {
        $group: {
          _id: '$tratamiento.nombre',
          cantidad: { $sum: '$cantidad' },
        },
      },

      {
        $group: {
          _id: null,
          lentes: { $sum: '$cantidad' },
          tratamientos: {
            $push: {
              tratamiento: '$_id',
              cantidad: '$cantidad',
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          lentes: '$lentes',
          tratamiento: {
            $map: {
              input: '$tratamientos',
              as: 'trata',
              in: {
                tratamiento: '$$trata.tratamiento',
                cantidad: '$$trata.cantidad',
                porcentaje: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$$trata.cantidad', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    return antireflejo;
  }

  private async kpiProgresivos(filtrador: FiltroVentaI) {
    const progresivos = await this.VentaExcelSchema.aggregate([
      {
        $match: filtrador,
      },

      {
        $lookup: {
          from: 'MarcaLente',
          foreignField: '_id',
          localField: 'marcaLente',
          as: 'marcaLente',
        },
      },

      {
        $lookup: {
          from: 'TipoLente',
          foreignField: '_id',
          localField: 'tipoLente',
          as: 'tipoLente',
        },
      },

      {
        $unwind: { path: '$marcaLente', preserveNullAndEmptyArrays: false },
      },
      {
        $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: false },
      },
      {
        $match: {
          'tipoLente.nombre': { $eq: 'PROGRESIVO' },
        },
      },
      {
        $group: {
          _id: '$marcaLente.nombre',
          cantidad: { $sum: '$cantidad' },
        },
      },
    ]);
    return progresivos;
  }
  private async kpiOcupacional(filtrador: FiltroVentaI) {
    const progresivos = await this.VentaExcelSchema.aggregate([
      {
        $match: filtrador,
      },

      {
        $lookup: {
          from: 'MarcaLente',
          foreignField: '_id',
          localField: 'marcaLente',
          as: 'marcaLente',
        },
      },

      {
        $lookup: {
          from: 'TipoLente',
          foreignField: '_id',
          localField: 'tipoLente',
          as: 'tipoLente',
        },
      },

      {
        $unwind: { path: '$marcaLente', preserveNullAndEmptyArrays: false },
      },
      {
        $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: false },
      },
      {
        $match: {
          'tipoLente.nombre': { $eq: 'OCUPACIONAL' },
        },
      },
      {
        $group: {
          _id: '$marcaLente.nombre',
          cantidad: { $sum: '$cantidad' },
        },
      },
    ]);
    return progresivos;
  }

  public async kpiMaterial(kpiDto: VentaDto) {
    const data: any[] = [];
    const filtrador = filtradorVenta(kpiDto);
    for (let su of kpiDto.sucursal) {
      filtrador.sucursal = new Types.ObjectId(su);
      const kpiMaterial = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            ...filtrador,
            producto: productos.lente,
          },
        },
        {
          $lookup: {
            from: 'Material',
            foreignField: '_id',
            localField: 'material',
            as: 'material',
          },
        },
        {
          $lookup: {
            from: 'Sucursal',
            foreignField: '_id',
            localField: 'sucursal',
            as: 'sucursal',
          },
        },
        {
          $unwind: { path: '$material', preserveNullAndEmptyArrays: false },
        },
        {
          $unwind: { path: '$sucursal', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$material.nombre',
            cantidad: { $sum: '$cantidad' },
            sucursalNombre: { $first: '$sucursal.nombre' },
          },
        },

        {
          $group: {
            _id: null,
            lentes: {
              $sum: '$cantidad',
            },
            materiales: {
              $push: {
                nombre: '$_id',
                cantidad: '$cantidad',
              },
            },
            sucursalNombre: { $first: '$sucursalNombre' },
          },
        },
        {
          $project: {
            _id: 0,
            lentes: 1,
            sucursal: '$sucursalNombre',
            materiales: {
              $map: {
                input: '$materiales',
                as: 'material',
                in: {
                  nombre: '$$material.nombre',
                  cantidad: '$$material.cantidad',
                  porcentaje: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ['$$material.cantidad', '$lentes'] },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
      ]);

      const resultado = {
        kpiMaterial: kpiMaterial[0],
      };
      data.push(resultado);
    }
    return data;
  }

  async kpiEmpresas(kpiEmpresaDto: VentaTodasDto) {
    const dataEmpresas: any = [];
    for (let e of kpiEmpresaDto.empresa) {
      const sucursales: any[] = [];
      const empresa = await this.empresaService.buscarEmpresa(e);
      if (kpiEmpresaDto.sucursal.length > 0) {
        const sucursalesPromises = kpiEmpresaDto.sucursal.map((s) =>
          this.sucursalService.listarSucursalId(new Types.ObjectId(s)),
        );
        sucursales.push(...(await Promise.all(sucursalesPromises)));
      } else {
        const s = await this.sucursalService.sucursalListaEmpresas(empresa._id);
        sucursales.push(...s);
      }
      if (empresa.nombre === 'OPTICENTRO') {
        const data = await this.kpiOpticentroEmpresa(kpiEmpresaDto, sucursales);
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      } else if (empresa.nombre === 'ECONOVISION') {
        const data = await this.kpiEconovisionEmpresa(
          kpiEmpresaDto,
          sucursales,
        );
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      } else if (empresa.nombre === 'TU OPTICA') {
        const data = await this.kpiTuOpticaEmpresa(kpiEmpresaDto, sucursales);
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      } else if (empresa.nombre === 'OPTISERVICE S.R.L') {
        const data = await this.kpiOptiserviceEmpresa(
          kpiEmpresaDto,
          sucursales,
        );
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      }
    }
    return dataEmpresas;
  }

  private async kpiOpticentroEmpresa(
    kpiEmpresaDto: VentaTodasDto,
    sucursal: any[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const data: any[] = [];
    for (let su of sucursal) {
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            ...filtrador,
            sucursal: su._id,
          },
        },
        {
          $lookup: {
            from: 'Tratamiento',
            foreignField: '_id',
            localField: 'tratamiento',
            as: 'tratamiento',
          },
        },
        {
          $lookup: {
            from: 'MarcaLente',
            foreignField: '_id',
            localField: 'marcaLente',
            as: 'marcaLente',
          },
        },

        {
          $lookup: {
            from: 'TipoVenta',
            foreignField: '_id',
            localField: 'tipoVenta',
            as: 'tipoVenta',
          },
        },

        {
          $lookup: {
            from: 'TipoLente',
            foreignField: '_id',
            localField: 'tipoLente',
            as: 'tipoLente',
          },
        },
        {
          $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: '$marcaLente', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: '$tipoVenta', preserveNullAndEmptyArrays: true },
        },

        {
          $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
        },

        {
          $group: {
            _id: null,

            lentes: {
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'LENTE'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            monturas :{
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'MONTURA'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            }
            ,

            tickets: {
              $sum: {
                $cond: {
                  if: { $and: [{ $eq: ['$aperturaTicket', '1'] }] },
                  then: 1,
                  else: 0,
                },
              },
            },

            antireflejo: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tratamiento.nombre', 'CLARITY'] },
                      { $eq: ['$tratamiento.nombre', 'CLARITY PLUS'] },
                      { $eq: ['$tratamiento.nombre', 'BLUCLARITY'] },
                      { $eq: ['$tratamiento.nombre', 'STOP AGE'] },
                      { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                    ],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },

            progresivos: {
              $sum: {
                $cond: {
                  if: { $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            ocupacional: {
              $sum: {
                $cond: {
                  if: { $eq: ['$tipoLente.nombre', 'OCUPACIONAL'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            lentes: 1,
            progresivos: 1,
            monturas:1,
            ocupacional: 1,
            ocupacionalProgresivos: 1,
            antireflejo: 1,
            tickets: 1,
            progresivosOcupacionales: {
              $add: ['$progresivos', '$ocupacional'],
            },
            progresivosOcupacionalesPorcentaje: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $add: ['$progresivos', '$ocupacional'] },
                            '$lentes',
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeAntireflejo: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$antireflejo', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeProgresivos: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$progresivos', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeOcupacionales: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$ocupacional', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ]);
      console.log(dataKpi);
      
      const resultado = {
        sucursal: su.nombre,
        id: su._id,
        dataKpi,
      };
      data.push(resultado);
    }

    return data;
  }
  private async kpiEconovisionEmpresa(
    kpiEmpresaDto: VentaTodasDto,
    sucursales: any[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const data: any[] = [];

    for (let su of sucursales) {
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            ...filtrador,
            sucursal: su._id,
            //producto:productos.lente
          },
        },
        {
          $lookup: {
            from: 'Tratamiento',
            foreignField: '_id',
            localField: 'tratamiento',
            as: 'tratamiento',
          },
        },

        {
          $lookup: {
            from: 'MarcaLente',
            foreignField: '_id',
            localField: 'marcaLente',
            as: 'marcaLente',
          },
        },
        {
          $lookup: {
            from: 'TipoColor',
            foreignField: '_id',
            localField: 'tipoColor',
            as: 'tipoColor',
          },
        },

        {
          $lookup: {
            from: 'TipoLente',
            foreignField: '_id',
            localField: 'tipoLente',
            as: 'tipoLente',
          },
        },
        {
          $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: true },
        },

        {
          $unwind: { path: '$marcaLente', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: '$tipoColor', preserveNullAndEmptyArrays: true },
        },

        {
          $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: null,
            lentes: {
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'LENTE'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
              monturas :{
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'MONTURA'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            antireflejo: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                      { $eq: ['$tratamiento.nombre', 'BLUE SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'GREEN SHIELD'] },
                    ],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            tickets: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ['$aperturaTicket', '1'] },
                      { $ne: ['$producto', 'OTRO PRODUCTO'] },
                    ],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            progresivos: {
              $sum: {
                $cond: {
                  if: { $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }] },
                  then: 1,
                  else: 0,
                },
              },
            },
            ocupacional: {
              $sum: {
                $cond: {
                  if: { $eq: ['$tipoLente.nombre', 'OCUPACIONAL'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },

            fotosensibles: {
              $sum: {
                $cond: {
                  if: {
                    $or: [{ $eq: ['$tipoColor.nombre', 'SOLAR ACTIVE'] }],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
          },
        },

        {
          $project: {
            lentes: 1,
            antireflejo: 1,
            tickets: 1,
            monturas:1,
            porcentajeAntireflejo: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$antireflejo', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            progresivos: 1,
            ocupacional: 1,
            progresivosOcupacionales: {
              $add: ['$progresivos', '$ocupacional'],
            },
            progresivosOcupacionalesPorcentaje: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $add: ['$progresivos', '$ocupacional'] },
                            '$lentes',
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeProgresivos: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$progresivos', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeOcupacionales: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$ocupacional', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            fotosensibles: 1,
            procentajeFotosensibles: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$fotosensibles', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ]);
      const resultado = {
        sucursal: su.nombre,
        id: su._id,
        dataKpi,
      };
      data.push(resultado);
    }
    return data;
  }
  private async kpiTuOpticaEmpresa(
    kpiEmpresaDto: VentaTodasDto,
    sucursales: any[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const data: any[] = [];
    for (let su of sucursales) {
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            ...filtrador,
            sucursal: su._id,
          },
        },
        {
          $lookup: {
            from: 'Tratamiento',
            foreignField: '_id',
            localField: 'tratamiento',
            as: 'tratamiento',
          },
        },

        {
          $lookup: {
            from: 'MarcaLente',
            foreignField: '_id',
            localField: 'marcaLente',
            as: 'marcaLente',
          },
        },
        {
          $lookup: {
            from: 'TipoColor',
            foreignField: '_id',
            localField: 'tipoColor',
            as: 'tipoColor',
          },
        },
        {
          $lookup: {
            from: 'TipoLente',
            foreignField: '_id',
            localField: 'tipoLente',
            as: 'tipoLente',
          },
        },

        {
          $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: true },
        },

        {
          $unwind: { path: '$marcaLente', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: '$tipoColor', preserveNullAndEmptyArrays: true },
        },

        {
          $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: null,
            lentes: {
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'LENTE'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },

              monturas :{
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'MONTURA'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },

            antireflejo: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tratamiento.nombre', 'BLUE SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'GREEN SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                    ],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            tickets: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ['$aperturaTicket', '1'] },
                      { $ne: ['$producto', 'OTRO PRODUCTO'] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            progresivos: {
              $sum: {
                $cond: {
                  if: { $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }] },
                  then: 1,
                  else: 0,
                },
              },
            },
            ocupacional: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ['$tipoLente.nombre', 'OCUPACIONAL'],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },

            fotosensibles: {
              $sum: {
                $cond: {
                  if: {
                    $or: [{ $eq: ['$tipoColor.nombre', 'SOLAR ACTIVE'] }],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            lentes: 1,
            antireflejo: 1,
            tickets: 1,
            monturas:1,
            porcentajeAntireflejo: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$antireflejo', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            progresivos: 1,
            ocupacional: 1,
            progresivosOcupacionales: {
              $add: ['$progresivos', '$ocupacional'],
            },
            progresivosOcupacionalesPorcentaje: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $add: ['$progresivos', '$ocupacional'] },
                            '$lentes',
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeProgresivos: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$progresivos', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeOcupacionales: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$ocupacional', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            fotosensibles: 1,
            procentajeFotosensibles: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$fotosensibles', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ]);
      const resultado = {
        sucursal: su.nombre,
        id: su._id,
        dataKpi,
      };

      data.push(resultado);
    }

    return data;
  }

  private async kpiOptiserviceEmpresa(
    kpiEmpresaDto: VentaTodasDto,
    sucursales: any[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const data: any[] = [];
    for (let su of sucursales) {
      const dataKpi = await this.VentaExcelSchema.aggregate([
        {
          $match: {
            ...filtrador,
            sucursal: su._id,
          },
        },
        {
          $lookup: {
            from: 'Tratamiento',
            foreignField: '_id',
            localField: 'tratamiento',
            as: 'tratamiento',
          },
        },

        {
          $lookup: {
            from: 'MarcaLente',
            foreignField: '_id',
            localField: 'marcaLente',
            as: 'marcaLente',
          },
        },
        {
          $lookup: {
            from: 'TipoColor',
            foreignField: '_id',
            localField: 'tipoColor',
            as: 'tipoColor',
          },
        },
        {
          $lookup: {
            from: 'TipoVenta',
            foreignField: '_id',
            localField: 'tipoVenta',
            as: 'tipoVenta',
          },
        },
        {
          $lookup: {
            from: 'TipoLente',
            foreignField: '_id',
            localField: 'tipoLente',
            as: 'tipoLente',
          },
        },
        {
          $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: true },
        },

        {
          $unwind: { path: '$marcaLente', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: '$tipoColor', preserveNullAndEmptyArrays: true },
        },

        {
          $unwind: { path: '$tipoVenta', preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: null,
            lentes: {
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'LENTE'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
                monturas :{
              $sum: {
                $cond: {
                  if: { $eq: ['$producto', 'MONTURA'] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
            tickets: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ['$aperturaTicket', '1'] },
                      { $ne: ['$producto', 'OTRO PRODUCTO'] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },

            antireflejo: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tratamiento.nombre', 'BLUE SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'GREEN SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                    ],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },

            progresivos: {
              $sum: {
                $cond: {
                  if: { $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }] },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },

            fotoCromatico: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tipoColor.nombre', 'FOTOCROMATICO GRIS'] },
                      { $eq: ['$tipoColor.nombre', 'FOTOCROMATICO CAFE'] },
                      { $eq: ['$tipoColor.nombre', 'FOTOCROMATICO'] },
                      { $eq: ['$tipoColor.nombre', 'SOLAR ACTIVE'] },
                    ],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },
          },
        },

        {
          $project: {
            monturas:1,
            lentes: 1,
            antireflejo: 1,
            progresivos: 1,
            fotoCromatico: 1,
            tickets: 1,
            //ventas:1,
            porcentajeProgresivos: {
              $round: [
                {
                  $multiply: [{ $divide: ['$progresivos', '$lentes'] }, 100],
                },
                0,
              ],
            },
            porcentajeAntireflejo: {
              $round: [
                {
                  $multiply: [{ $divide: ['$antireflejo', '$lentes'] }, 100],
                },
                0,
              ],
            },

            procentajeFotoCromatico: {
              $round: [
                {
                  $multiply: [{ $divide: ['$fotoCromatico', '$lentes'] }, 100],
                },
                0,
              ],
            },
          },
        },
      ]);
      const resultado = {
        sucursal: su.nombre,
        id: su._id,
        dataKpi,
      };
      data.push(resultado);
    }

    return data;
  }

 


  async InformacionLenteAsesor(
    asesor: string,
    informacionVentaDto: InformacionVentaDto,
  ) {
    const filtrador = filtroInformacionAsesor(asesor, informacionVentaDto);

    
    const [antireflejo, progresivos, ocupacional, a] = await Promise.all([
      this.kpiAntireflejo(filtrador),
      this.kpiProgresivos(filtrador),
      this.kpiOcupacional(filtrador),
      this.asesorService.asesorFindOne(new Types.ObjectId(asesor))
     
    ]);

    return { antireflejo, progresivos, ocupacional, asesor:a.usuario};
  }



  async ventasLenteAsesores(ventaTodasDto: VentaTodasDto) {
    const dataEmpresas: any = [];
    for (let e of ventaTodasDto.empresa) {
      const sucursales: any[] = [];
      const empresa = await this.empresaService.buscarEmpresa(e);
      if (ventaTodasDto.sucursal.length > 0) {
        const sucursalesPromises = ventaTodasDto.sucursal.map((s) =>
          this.sucursalService.listarSucursalId(new Types.ObjectId(s)),
        );
        sucursales.push(...(await Promise.all(sucursalesPromises)));
      } else {
        const s = await this.sucursalService.sucursalListaEmpresas(empresa._id);
        sucursales.push(...s);
      }
      if (empresa.nombre === EmpresaE.OPTICENTRO) {
        const data = await this.ventaLentesOpticentroAsesores(
          ventaTodasDto,
          sucursales,
        );
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      } else if (empresa.nombre === EmpresaE.ECONOVISION) {
        const data = await this.ventaLenteEconovisionAsesores(
          ventaTodasDto,
          sucursales,
        );
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      } else if(empresa.nombre=== EmpresaE.TU_OPTICA){
         const data=  await this.ventaLenteTuOpticaAsesores(ventaTodasDto,sucursales)
         const resultado ={
           idEmpresa:empresa._id,
           empresa:empresa.nombre,
           data
         }          
         dataEmpresas.push(resultado)
       }else if(empresa.nombre=== EmpresaE.OPTISERVICE){
         const data=  await this.ventaLenteOferServiceAsesores(ventaTodasDto,sucursales)
         const resultado ={
           idEmpresa:empresa._id,
           empresa:empresa.nombre,
           data
         }                   
         dataEmpresas.push(resultado)
       }
    }
    return dataEmpresas;
  }
  private async ventaLentesOpticentroAsesores(
    kpiEmpresaDto: VentaTodasDto,
    sucursal: SucursalI[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
   
    
    const data: any[] = [];
    for (let su of sucursal) {
      const ventaAsesor: any[] = [];

      const asesores = await this.asesorService.listarAsesorPorSucursal(su._id);
      if (asesores) {
        for (const asesor of asesores) {
          const venta = await this.VentaExcelSchema.aggregate([
            {
              $match: {
                ...filtrador,
                sucursal: su._id,
                asesor: new Types.ObjectId(asesor.id),
              },
            },
            {
              $lookup: {
                from: 'Tratamiento',
                foreignField: '_id',
                localField: 'tratamiento',
                as: 'tratamiento',
              },
            },
            {
              $lookup: {
                from: 'MarcaLente',
                foreignField: '_id',
                localField: 'marcaLente',
                as: 'marcaLente',
              },
            },

            {
              $lookup: {
                from: 'TipoVenta',
                foreignField: '_id',
                localField: 'tipoVenta',
                as: 'tipoVenta',
              },
            },

            {
              $lookup: {
                from: 'TipoLente',
                foreignField: '_id',
                localField: 'tipoLente',
                as: 'tipoLente',
              },
            },

            {
              $unwind: {
                path: '$tratamiento',
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $unwind: {
                path: '$marcaLente',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: { path: '$tipoVenta', preserveNullAndEmptyArrays: true },
            },

            {
              $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
            },

            {
              $group: {
                _id: null,

                lentes: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$producto', 'LENTE'] },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },

                tickets: {
                  $sum: {
                    $cond: {
                      if: { $and: [{ $eq: ['$aperturaTicket', '1'] }] },
                      then: 1,
                      else: 0,
                    },
                  },
                },

                antireflejo: {
                  $sum: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ['$tratamiento.nombre', 'CLARITY'] },
                          { $eq: ['$tratamiento.nombre', 'CLARITY PLUS'] },
                          { $eq: ['$tratamiento.nombre', 'BLUCLARITY'] },
                          { $eq: ['$tratamiento.nombre', 'STOP AGE'] },
                          { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                        ],
                      },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },

                progresivos: {
                  $sum: {
                    $cond: {
                      if: {
                        $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }],
                      },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },
                ocupacional: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$tipoLente.nombre', 'OCUPACIONAL'] },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },
              },
            },
            {
              $project: {
                lentes: 1,
                progresivos: 1,
                asesor: '$aseror.ususario',
                ocupacional: 1,
                ocupacionalProgresivos: 1,
                antireflejo: 1,
                tickets: 1,
                progresivosOcupacionales: {
                  $add: ['$progresivos', '$ocupacional'],
                },
                progresivosOcupacionalesPorcentaje: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                { $add: ['$progresivos', '$ocupacional'] },
                                '$lentes',
                              ],
                            },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
                porcentajeAntireflejo: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$antireflejo', '$lentes'] },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
                porcentajeProgresivos: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$progresivos', '$lentes'] },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
                porcentajeOcupacionales: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$ocupacional', '$lentes'] },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
          ]);
          if (venta.length > 0) {
            const data = {
              asesor: asesor.usuario,
              idAsesor: asesor.id,
              ...venta[0],
            };

            ventaAsesor.push(data);
          }
        }

        const dataSucursal = {
          sucursal: su.nombre,
          idSucursal:su._id,
          venta: ventaAsesor,
        };

        data.push(dataSucursal);
      }
    }

    return data;
  }
  private async ventaLenteEconovisionAsesores(
    kpiEmpresaDto: VentaTodasDto,
    sucursal: SucursalI[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const data: any[] = [];
    for (let su of sucursal) {
      const ventaAsesor: any[] = [];
      const asesores = await this.asesorService.listarAsesorPorSucursal(su._id);
      if (asesores.length > 0) {
        for (const asesor of asesores) {
          const venta = await this.VentaExcelSchema.aggregate([
            {
              $match: {
                ...filtrador,
                sucursal: su._id,
                asesor: new Types.ObjectId(asesor.id),
              },
            },
            {
              $lookup: {
                from: 'Tratamiento',
                foreignField: '_id',
                localField: 'tratamiento',
                as: 'tratamiento',
              },
            },

            {
              $lookup: {
                from: 'MarcaLente',
                foreignField: '_id',
                localField: 'marcaLente',
                as: 'marcaLente',
              },
            },
            {
              $lookup: {
                from: 'TipoColor',
                foreignField: '_id',
                localField: 'tipoColor',
                as: 'tipoColor',
              },
            },

            {
              $lookup: {
                from: 'TipoLente',
                foreignField: '_id',
                localField: 'tipoLente',
                as: 'tipoLente',
              },
            },
            {
              $unwind: {
                path: '$tratamiento',
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $unwind: {
                path: '$marcaLente',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: { path: '$tipoColor', preserveNullAndEmptyArrays: true },
            },

            {
              $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
            },
            {
              $group: {
                _id: null,
                lentes: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$producto', 'LENTE'] },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },
                antireflejo: {
                  $sum: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                          { $eq: ['$tratamiento.nombre', 'BLUE SHIELD'] },
                          { $eq: ['$tratamiento.nombre', 'GREEN SHIELD'] },
                        ],
                      },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },
                tickets: {
                  $sum: {
                    $cond: {
                      if: {
                        $and: [
                          { $eq: ['$aperturaTicket', '1'] },
                          { $ne: ['$producto', 'OTRO PRODUCTO'] },
                        ],
                      },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },
                progresivos: {
                  $sum: {
                    $cond: {
                      if: {
                        $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }],
                      },
                      then: 1,
                      else: 0,
                    },
                  },
                },
                ocupacional: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$tipoLente.nombre', 'OCUPACIONAL'] },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },

                fotosensibles: {
                  $sum: {
                    $cond: {
                      if: {
                        $or: [{ $eq: ['$tipoColor.nombre', 'SOLAR ACTIVE'] }],
                      },
                      then: '$cantidad',
                      else: 0,
                    },
                  },
                },
              },
            },

            {
              $project: {
                lentes: 1,
                antireflejo: 1,
                tickets: 1,
                porcentajeAntireflejo: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$antireflejo', '$lentes'] },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
                progresivos: 1,
                ocupacional: 1,
                progresivosOcupacionales: {
                  $add: ['$progresivos', '$ocupacional'],
                },
                progresivosOcupacionalesPorcentaje: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                { $add: ['$progresivos', '$ocupacional'] },
                                '$lentes',
                              ],
                            },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
                porcentajeProgresivos: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$progresivos', '$lentes'] },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
                porcentajeOcupacionales: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$ocupacional', '$lentes'] },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
                fotosensibles: 1,
                procentajeFotosensibles: {
                  $cond: {
                    if: { $gt: ['$lentes', 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$fotosensibles', '$lentes'] },
                            100,
                          ],
                        },
                        0,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
          ]);
          if (venta.length > 0) {
            const data = {
              asesor: asesor.usuario,
              idAsesor: asesor.id,
              ...venta[0],
            };

            ventaAsesor.push(data);
          }
        }
        const dataSucursal = {
          sucursal: su.nombre,
          idSucursal:su._id,
          venta: ventaAsesor,
        };

        data.push(dataSucursal);
      }
    }
    return data;
  }
   private async ventaLenteTuOpticaAsesores(kpiEmpresaDto:VentaTodasDto, sucursales:SucursalI[]){
      const filtrador = filtradorVenta(kpiEmpresaDto)
      const data:any[]=[]
      for (let su of sucursales){
        const ventaAsesor: any[] = [];
        const asesores = await this.asesorService.listarAsesorPorSucursal(su._id);
        if (asesores.length > 0) {
          for (const asesor of asesores) {
        const venta = await this.VentaExcelSchema.aggregate([
          {
            $match:{
              ...filtrador,
              sucursal: su._id,
              asesor: new Types.ObjectId(asesor.id),
            }
          },
          {
            $lookup:{
              from:'Tratamiento',
              foreignField:'_id',
              localField:'tratamiento',
              as:'tratamiento',
              
            }
          },
  
          {
            $lookup:{
              from:'MarcaLente',
              foreignField:'_id',
              localField:'marcaLente',
              as:'marcaLente'
            }
          },
          {
            $lookup:{
              from:'TipoColor',
              foreignField:'_id',
              localField:'tipoColor',
              as:'tipoColor'
            }
          },
          {
            $lookup:{
              from:'TipoLente',
              foreignField:'_id',
              localField:'tipoLente',
              as:'tipoLente'
            }
          },
       
       
      
          {
            $unwind:{ path: '$tratamiento', preserveNullAndEmptyArrays: true }
          },
  
          {
            $unwind:{ path: '$marcaLente', preserveNullAndEmptyArrays: true }
          },
          {
            $unwind:{ path: '$tipoColor', preserveNullAndEmptyArrays: true }
          },
        
          {
            $unwind:{ path: '$tipoLente', preserveNullAndEmptyArrays: true }
          },
          {
            $group:{
              _id:null,
              lentes:{
                $sum:{
                  $cond:{
                    if:{$eq:['$producto','LENTE']},
                    then:'$cantidad',
                    else:0
                  }
                }
              },  
              
              antireflejo:{
                $sum:{
                  $cond:{
                    if:{ $or:[
                      {$eq:['$tratamiento.nombre','BLUE SHIELD']},
                      {$eq:['$tratamiento.nombre','GREEN SHIELD']},
                      {$eq:['$tratamiento.nombre','ANTIREFLEJO']}
                   
                    ]},
                    then:'$cantidad',
                    else:0
                  }
                }
              },
              tickets:{
                $sum:{
                  $cond:{
                    if:{$and:[
                      {$eq:['$aperturaTicket', '1']},
                      {$ne:['$producto', 'OTRO PRODUCTO']}
                      
                    ]},
                    then:1,
                    else:0
  
                  }
                }
              },
              progresivos:{
                $sum:{
                  $cond:{
                    if:{$or:[
                    {$eq:['$tipoLente.nombre','PROGRESIVO']}]},
                    then:1,
                    else:0
                  }
                }
              
              },
              ocupacional:{
                $sum:{
                  $cond:{
                    if:{
                      $eq:['$tipoLente.nombre','OCUPACIONAL']
                    
                    },
                    then:1,
                    else:0
                  }
                }
              
              },
  
              fotosensibles: {
                $sum: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ["$tipoColor.nombre", "SOLAR ACTIVE"] },
                      ]
                    },
                    then: "$cantidad",
                    else: 0
                  }
                }
              },
    
            
  
  
            }
          },
          {
            $project:{
              lentes:1,
              antireflejo:1,
              tickets:1,
              porcentajeAntireflejo: {
               $cond:{
                if:{$gt:['$lentes',0]},
                then:{
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$antireflejo', '$lentes'] },
                        100
                      ]
                    },
                    0
                  ]
                },
                else:0
               }
              
              },
              progresivos:1,
              ocupacional:1,
              progresivosOcupacionales: { $add: ['$progresivos', '$ocupacional'] },
              progresivosOcupacionalesPorcentaje: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
                    $round: [
                      {
                        $multiply: [
                          { $divide: [{ $add: ['$progresivos', '$ocupacional'] }, '$lentes'] },
                          100
                        ]
                      },
                      0
                    ]
                  },
                  else:0
                }
              },
              porcentajeProgresivos: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$progresivos','$lentes'] },
                      100
                    ]
                  },
                  0
                ]
              },
              else:0
            }
              
              },
              porcentajeOcupacionales: {
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$ocupacional','$lentes'] },
                      100
                    ]
                  },
                  0
                ]
              },
              else:0
            }
              
              },
              fotosensibles:1,
              procentajeFotosensibles:{
                $cond:{
                  if:{$gt:['$lentes',0]},
                  then:{
                $round:[
                  {
                    $multiply:[
                      { $divide: ['$fotosensibles','$lentes'] },
                      100
  
                    ]
                  }
                  ,0
                ]
              },
              else:0
            }
              },
           
              
                
            }
          }
        ])
        if (venta.length > 0) {
          const data = {
            asesor: asesor.usuario,
            idAsesor: asesor.id,
            ...venta[0],
          };

          ventaAsesor.push(data);
        }
          }
          const dataSucursal = {
            sucursal: su.nombre,
            idSucursal:su._id,
            venta: ventaAsesor,
          };
  
          data.push(dataSucursal);
            

        }
      }
        
      
  
      return data
     }
  
    private async ventaLenteOferServiceAsesores(kpiEmpresaDto:VentaTodasDto, sucursales:any[]){      
      const filtrador = filtradorVenta(kpiEmpresaDto)
      const data:any[]=[]
      for(let su of sucursales){
        const ventaAsesor: any[] = [];
        const asesores = await this.asesorService.listarAsesorPorSucursal(su._id);
          if(asesores.length > 0) {
            for (const asesor of asesores) {
              const venta = await this.VentaExcelSchema.aggregate([
                {
                  $match:{
                    ...filtrador,
                    sucursal: su._id,
                    asesor: new Types.ObjectId(asesor.id),
                  }
                },
                {
                  $lookup:{
                    from:'Tratamiento',
                    foreignField:'_id',
                    localField:'tratamiento',
                    as:'tratamiento',
                    
                  }
                },
        
                {
                  $lookup:{
                    from:'MarcaLente',
                    foreignField:'_id',
                    localField:'marcaLente',
                    as:'marcaLente'
                  }
                },
                {
                  $lookup:{
                    from:'TipoColor',
                    foreignField:'_id',
                    localField:'tipoColor',
                    as:'tipoColor'
                  }
                },
                {
                  $lookup:{
                    from:'TipoVenta',
                    foreignField:'_id',
                    localField:'tipoVenta',
                    as:'tipoVenta'
                  }
                },
                {
                  $lookup:{
                    from:'TipoLente',
                    foreignField:'_id',
                    localField:'tipoLente',
                    as:'tipoLente'
                  }
                },
                {
                  $unwind:{ path: '$tipoLente', preserveNullAndEmptyArrays: true }
                },
                {
                  $unwind:{ path: '$tratamiento', preserveNullAndEmptyArrays: true }
                },
        
                {
                  $unwind:{ path: '$marcaLente', preserveNullAndEmptyArrays: true }
                },
                {
                  $unwind:{ path: '$tipoColor', preserveNullAndEmptyArrays: true }
                },
              
                {
                  $unwind:{ path: '$tipoVenta', preserveNullAndEmptyArrays: true }
                },
                {
                  $group:{
                    _id:null,
                    lentes:{
                      $sum:{
                        $cond:{
                          if:{$eq:['$producto','LENTE']},
                          then:'$cantidad',
                          else:0
                        }
                      }
                    },
                  
                    tickets: {
                      $sum: {
                        $cond: {
                          if:{$and:[
                            {$eq:['$aperturaTicket', '1']},
                            {$ne:['$producto', 'OTRO PRODUCTO']}
                          ]},
                          then: 1,
                          else: 0
                        }
                      }
                    },
      
                 
                    antireflejo:{
                      $sum:{
                        $cond:{
                          if:{ $or:[
                        
                            {$eq:['$tratamiento.nombre','BLUE SHIELD']},
                            {$eq:['$tratamiento.nombre','GREEN SHIELD']},
                            {$eq:['$tratamiento.nombre','ANTIREFLEJO']}
                         
                          ]},
                          then:'$cantidad',
                          else:0
                        }
                      }
                    },
             
                 
                    progresivos:{
                      $sum:{
                        $cond:{
                          if:{$or:[
                            {$eq:['$tipoLente.nombre','PROGRESIVO']}
                 
                          ]},
                          then:'$cantidad',
                          else:0
                        }
                      }
                    
                    },
                   
        
                    fotoCromatico: {
                      $sum: {
                        $cond: {
                          if: {
                            $or: [
                              { $eq: ["$tipoColor.nombre", "FOTOCROMATICO GRIS"] },   
                              { $eq: ["$tipoColor.nombre", "FOTOCROMATICO CAFE"] },
                              { $eq: ["$tipoColor.nombre", "FOTOCROMATICO"] },  
                              { $eq: ["$tipoColor.nombre", "SOLAR ACTIVE"] },  
                            ]
                          },
                          then: "$cantidad",
                          else: 0
                        }
                      }
                    },
        
               
                
        
                 
                  }
                },
        
                {
                  $project:{
                    lentes:1,
                    antireflejo:1,
                    progresivos:1,
                    fotoCromatico:1,
                    tickets:1,
                    //ventas:1,
                    porcentajeProgresivos: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$progresivos','$lentes'] },
                            100
                          ]
                        },
                        0
                      ]
                    
                    },
                    porcentajeAntireflejo: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$antireflejo', '$lentes'] },
                            100
                          ]
                        },
                        0
                      ]
                    
                    },
                
               
                    procentajeFotoCromatico:{
                      $round:[
                        {
                          $multiply:[
                            { $divide: ['$fotoCromatico','$lentes'] },
                            100
        
                          ]
                        }
                        ,0
                      ]
                    },
                
                  }
                }
            
              ])
              if (venta.length > 0) {
                const data = {
                  asesor: asesor.usuario,
                  idAsesor: asesor.id,
                  ...venta[0],
                };
      
                ventaAsesor.push(data);
              }
                }
                const dataSucursal = {
                  sucursal: su.nombre,
                  idSucursal:su._id,
                  venta: ventaAsesor,
                };
        
                data.push(dataSucursal);
                  
      
              }
            }
              
            
            
      return data
    }

}
